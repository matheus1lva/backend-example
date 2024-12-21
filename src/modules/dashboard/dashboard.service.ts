import { Service } from "typedi";
import { DashboardData } from "./types";
import { MeetingsRepository } from "../meetings/meetings.repository";
import { TasksRepository } from "../tasks/tasks.repository";
import { RedisService } from "../redis/redis.service";

@Service()
export class DashboardService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly redisService: RedisService
  ) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:${userId}`;
    const cachedData = await this.redisService.get<DashboardData>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const [totalMeetings, upcomingMeetings, overdueTasks, taskSummary] =
      await Promise.all([
        this.meetingsRepository.countMeetingsByUserId(userId),
        this.meetingsRepository.getUpcomingMeetings(userId),
        this.tasksRepository.getOverdueTasks(userId),
        this.tasksRepository.getGroupedTasksByStatus(userId),
      ]);

    const dashboardData = {
      totalMeetings,
      taskSummary,
      upcomingMeetings,
      overdueTasks,
    };

    await this.redisService.set(cacheKey, dashboardData, 300);

    return dashboardData;
  }
}
