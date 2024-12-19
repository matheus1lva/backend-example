import { DashboardData } from "@/modules/dashboard/types";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { TasksRepository } from "@/modules/tasks/tasks.repository";
import { Service } from "typedi";

@Service()
export class DashboardRepository {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly tasksRepository: TasksRepository
  ) {}
  async getDashboardData(userId: string): Promise<DashboardData> {
    const [totalMeetings, upcomingMeetings, overdueTasks, taskSummary] =
      await Promise.all([
        this.meetingsRepository.countMeetingsByUserId(userId),
        this.meetingsRepository.getUpcomingMeetings(userId),
        this.tasksRepository.getOverdueTasks(userId),
        this.tasksRepository.getGroupedTasksByStatus(userId),
      ]);

    return {
      totalMeetings,
      taskSummary,
      upcomingMeetings,
      overdueTasks,
    };
  }
}
