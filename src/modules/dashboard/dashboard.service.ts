import { Service } from "typedi";
import { DashboardData } from "@/modules/dashboard/types";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { TasksRepository } from "@/modules/tasks/tasks.repository";

@Service()
export class DashboardService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly tasksRepository: TasksRepository
  ) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    console.log({
      userIdservice: userId,
    });
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
