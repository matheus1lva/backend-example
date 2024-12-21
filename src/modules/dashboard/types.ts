import { UpcomingMeeting } from "../meetings/types";
import { OverdueTask } from "../tasks/types/overdue-task.type";

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
