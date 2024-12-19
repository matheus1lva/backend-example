import { IMeeting, Meeting } from "@/modules/meetings/meetings.model";
import { Types } from "mongoose";
import { Service } from "typedi";

@Service()
export class MeetingsRepository {
  async getMeetings(userId: string) {
    return Meeting.find({ userId });
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
}
