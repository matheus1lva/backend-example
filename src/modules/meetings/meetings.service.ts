import { AiService } from "@/modules/ai/ai.service";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { httpErrors } from "throw-http-errors/dist/httpErrors";
import { Service } from "typedi";
import { TasksService } from "../tasks/tasks.service";
import { IMeeting, Meeting } from "./meetings.model";

@Service()
export class MeetingsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly aiService: AiService,
    private readonly meetingsRepository: MeetingsRepository
  ) {}

  async getMeetings(userId: string) {
    return this.meetingsRepository.getMeetings(userId);
  }

  async getMeetingById(meetingId: string, userId: string) {
    return this.meetingsRepository.getMeetingById(meetingId, userId);
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

  async summarizeMeeting(userId: string, meetingId: string) {
    const meeting = await this.meetingsRepository.getMeetingById(
      meetingId,
      userId
    );

    if (!meeting || !meeting.transcript) {
      throw new httpErrors.NotFound("Meeting not found");
    }

    try {
      const summaryResponse = await this.aiService.summarizeMeeting({
        title: meeting.title,
        transcript: meeting.transcript,
      });

      const [, , updatedMeeting] = await Promise.all([
        this.meetingsRepository.updateMeeting({
          id: meetingId,
          summary: summaryResponse.summary,
          actionItems: summaryResponse.tasks.map((task) => task.title),
        }),
        this.tasksService.createTasksFromActionItems(
          userId,
          meetingId,
          summaryResponse.tasks.map((task) => task.title)
        ),
        this.meetingsRepository.getMeetingById(meetingId, userId),
      ]);

      return updatedMeeting;
    } catch (error) {
      console.error("Error in summarizeMeeting:", error);
      throw new Error("Failed to generate meeting summary");
    }
  }

  async getMeetingStats(userId: string) {
    const [totalMeetings, participantStats, upcomingMeetings] =
      await Promise.all([
        Meeting.countDocuments({ userId }),
        Meeting.aggregate([
          { $match: { userId } },
          { $unwind: "$participants" },
          {
            $group: {
              _id: "$participants",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        Meeting.find({
          userId,
          date: { $gte: new Date() },
        })
          .sort({ date: 1 })
          .limit(5),
      ]);

    const averageParticipants = await Meeting.aggregate([
      { $match: { userId } },
      { $project: { participantCount: { $size: "$participants" } } },
      { $group: { _id: null, average: { $avg: "$participantCount" } } },
    ]);

    return {
      totalMeetings,
      averageParticipants: Math.floor(averageParticipants[0]?.average || 0),
      mostFrequentParticipants: participantStats,
      upcomingMeetings,
    };
  }
}
