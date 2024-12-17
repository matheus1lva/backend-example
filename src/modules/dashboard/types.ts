import { UpcomingMeeting } from "@/modules/meetings/types";
import { OverdueTask } from "@/modules/tasks/types";

export interface DashboardData {
  totalMeetings: number;
  taskSummary: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  upcomingMeetings: UpcomingMeeting[];
  overdueTasks: OverdueTask[];
}
