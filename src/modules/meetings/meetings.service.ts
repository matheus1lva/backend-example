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

  async getMeetings(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [meetings, total] = await Promise.all([
      this.meetingsRepository.getMeetings(userId, skip, limit),
      this.meetingsRepository.countMeetings(userId),
    ]);

    return {
      data: meetings,
      total,
      page,
      limit,
    };
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
    return this.meetingsRepository.getMeetingStats(userId);
  }
}
