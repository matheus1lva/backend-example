import { Service } from "typedi";
import { Meeting, IMeeting } from "./meetings.model";
import { TasksService } from "../tasks/tasks.service";

@Service()
export class MeetingsService {
  constructor(private readonly tasksService: TasksService) {}

  async getMeetings(userId: string): Promise<IMeeting[]> {
    return Meeting.find({ userId });
  }

  async getMeetingById(userId: string, meetingId: string): Promise<IMeeting | null> {
    return Meeting.findOne({ _id: meetingId, userId });
  }

  async createMeeting(
    userId: string,
    title: string,
    date: Date,
    participants: string[]
  ): Promise<IMeeting> {
    const meeting = new Meeting({
      userId,
      title,
      date,
      participants,
    });
    return meeting.save();
  }

  async updateTranscript(
    userId: string,
    meetingId: string,
    transcript: string
  ): Promise<IMeeting | null> {
    return Meeting.findOneAndUpdate(
      { _id: meetingId, userId },
      { transcript },
      { new: true }
    );
  }

  async summarizeMeeting(
    userId: string,
    meetingId: string
  ): Promise<IMeeting | null> {
    const meeting = await this.getMeetingById(userId, meetingId);
    if (!meeting || !meeting.transcript) {
      throw new Error("Meeting not found or no transcript available");
    }

    // Mock AI service response
    const mockAiResponse = {
      summary: `Summary of meeting "${meeting.title}"`,
      actionItems: [
        `Review documentation for ${meeting.title}`,
        `Schedule follow-up meeting with team`,
        `Send meeting notes to participants`,
      ],
    };

    // Update meeting with summary and action items
    const updatedMeeting = await Meeting.findOneAndUpdate(
      { _id: meetingId, userId },
      {
        summary: mockAiResponse.summary,
        actionItems: mockAiResponse.actionItems,
      },
      { new: true }
    );

    // Create tasks from action items
    if (updatedMeeting) {
      await this.tasksService.createTasksFromActionItems(
        userId,
        meetingId,
        mockAiResponse.actionItems
      );
    }

    return updatedMeeting;
  }

  async getMeetingStats(userId: string) {
    const [
      totalMeetings,
      participantStats,
      upcomingMeetings,
    ] = await Promise.all([
      Meeting.countDocuments({ userId }),
      Meeting.aggregate([
        { $match: { userId } },
        { $unwind: "$participants" },
        { $group: {
          _id: "$participants",
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Meeting.find({
        userId,
        date: { $gte: new Date() }
      }).sort({ date: 1 }).limit(5)
    ]);

    const averageParticipants = await Meeting.aggregate([
      { $match: { userId } },
      { $project: { participantCount: { $size: "$participants" } } },
      { $group: { _id: null, average: { $avg: "$participantCount" } } }
    ]);

    return {
      totalMeetings,
      averageParticipants: averageParticipants[0]?.average || 0,
      mostFrequentParticipants: participantStats,
      upcomingMeetings,
    };
  }
}
