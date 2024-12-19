import { Service } from "typedi";
import { DashboardData } from "@/modules/dashboard/types";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { TasksRepository } from "@/modules/tasks/tasks.repository";
import { RedisService } from "@/modules/redis/redis.service";

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
