import { AiService } from "@/modules/ai/ai.service";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { httpErrors } from "throw-http-errors/dist/httpErrors";
import { Service } from "typedi";
import { TasksService } from "../tasks/tasks.service";
import { IMeeting, Meeting } from "./meetings.model";
import { RedisService } from "@/modules/redis/redis.service";
import { logger } from "@/utils";

@Service()
export class MeetingsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly aiService: AiService,
    private readonly meetingsRepository: MeetingsRepository,
    private readonly redisService: RedisService
  ) {}

  async getMeetings(userId: string, page = 1, limit = 10) {
    const cacheKey = `meetings:${userId}:${page}:${limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;
    const [meetings, total] = await Promise.all([
      this.meetingsRepository.getMeetings(userId, skip, limit),
      this.meetingsRepository.countMeetingsByUserId(userId),
    ]);

    const result = {
      data: meetings,
      total,
      page,
      limit,
    };

    await this.redisService.set(cacheKey, result, 300);
    return result;
  }

  async getMeetingById(meetingId: string, userId: string) {
    const cacheKey = `meeting:${meetingId}:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData as IMeeting;
    }

    const meeting = await this.meetingsRepository.getMeetingById(
      meetingId,
      userId
    );
    if (meeting) {
      await this.redisService.set(cacheKey, meeting, 300);
    }
    return meeting;
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
    const createdMeeting = await meeting.save();
    await this.redisService.del(`meetings:${userId}:*`);
    return createdMeeting;
  }

  async updateTranscript(
    userId: string,
    meetingId: string,
    transcript: string
  ): Promise<IMeeting | null> {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: meetingId, userId },
      { transcript },
      { new: true }
    );
    if (meeting) {
      await this.redisService.del(`meeting:${meetingId}:${userId}`);
      await this.redisService.del(`meetings:${userId}:*`);
    }
    return meeting;
  }

  async summarizeMeeting(userId: string, meetingId: string) {
    const meeting = await this.getMeetingById(meetingId, userId);

    if (!meeting) {
      throw new httpErrors.NotFound("Meeting not found");
    }

    try {
      const summaryResponse = await this.aiService.summarizeMeeting({
        title: meeting?.title ?? "",
        transcript: meeting?.transcript,
      });

      const [updatedMeeting] = await Promise.all([
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
      ]);

      // Cache meeting with summary for 24 hours since AI generation is expensive
      const ONE_DAY = 24 * 60 * 60;
      await Promise.all([
        this.redisService.set(
          `meeting:${meetingId}:${userId}`,
          updatedMeeting,
          ONE_DAY
        ),
        this.redisService.del(`meetings:${userId}:*`),
      ]);

      return updatedMeeting;
    } catch (error) {
      logger.error("Error in summarizeMeeting:", error);
      throw new Error("Failed to generate meeting summary");
    }
  }

  async getMeetingStats(userId: string) {
    return this.meetingsRepository.getMeetingStats(userId);
  }
}
