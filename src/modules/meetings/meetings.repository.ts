import { IMeeting, Meeting } from "@/modules/meetings/meetings.model";
import { Types } from "mongoose";
import { Service } from "typedi";

@Service()
export class MeetingsRepository {
  async getMeetings(userId: string, skip = 0, limit = 10) {
    return Meeting.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
  async getMeetingById(meetingId: string, userId: string) {
    return Meeting.findOne({ _id: meetingId, userId });
  }

  async updateMeeting(args: Partial<IMeeting>) {
    return Meeting.findOneAndUpdate(
      { _id: args._id },
      {
        title: args.title,
        transcript: args.transcript,
        summary: args.summary,
        actionItems: args.actionItems,
      },
      { new: true }
    );
  }

  async countMeetings(userId: string) {
    return Meeting.countDocuments({ userId });
  }

  async countMeetingsByUserId(userId: string) {
    return Meeting.countDocuments({ userId });
  }

  async getUpcomingMeetings(
    userId: string,
    limit = 5
  ): Promise<
    {
      _id: Types.ObjectId;
      title: string;
      date: Date;
      participantCount: number;
    }[]
  > {
    return await Meeting.aggregate([
      { $match: { userId, date: { $gte: new Date() } } },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          participantCount: { $size: "$participants" },
        },
      },
      { $sort: { date: 1 } },
      { $limit: limit },
    ]);
  }

  async getMeetingStats(userId: string) {
    const results = await Meeting.aggregate([
      { $match: { userId } },
      {
        $facet: {
          generalStats: [
            {
              $group: {
                _id: null,
                totalMeetings: { $sum: 1 },
                totalParticipants: { $sum: { $size: "$participants" } },
                shortestMeeting: { $min: "$duration" },
                longestMeeting: { $max: "$duration" },
                averageDuration: { $avg: "$duration" },
              },
            },
            {
              $project: {
                _id: 0,
                totalMeetings: 1,
                totalParticipants: 1,
                shortestMeeting: 1,
                longestMeeting: 1,
                averageDuration: { $round: ["$averageDuration", 1] },
                averageParticipants: {
                  $round: [
                    { $divide: ["$totalParticipants", "$totalMeetings"] },
                    2,
                  ],
                },
              },
            },
          ],
          topParticipants: [
            { $unwind: "$participants" },
            {
              $group: {
                _id: "$participants",
                meetingCount: { $sum: 1 },
              },
            },
            { $sort: { meetingCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 0,
                participant: "$_id",
                meetingCount: 1,
              },
            },
          ],
          meetingsByDayOfWeek: [
            {
              $group: {
                _id: { $dayOfWeek: "$date" },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                dayOfWeek: "$_id",
                count: 1,
              },
            },
          ],
        },
      },
    ]);

    const [stats] = results;

    return {
      generalStats: stats.generalStats[0] || {
        totalMeetings: 0,
        totalParticipants: 0,
        shortestMeeting: 0,
        longestMeeting: 0,
        averageDuration: 0,
        averageParticipants: 0,
      },
      topParticipants: stats.topParticipants,
      meetingsByDayOfWeek: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i + 1,
        count: (
          stats.meetingsByDayOfWeek.find((d: { dayOfWeek: number; count: number }) => d.dayOfWeek === i + 1) || {
            count: 0,
          }
        ).count,
      })),
    };
  }
}
