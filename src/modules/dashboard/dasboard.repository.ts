import { Meeting } from "@/modules/meetings/meetings.model";
import { Task } from "@/modules/tasks/tasks.model";
import { Types } from "mongoose";
import { Service } from "typedi";
import { DashboardData } from "./types";

@Service()
export class DashboardRepository {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();

    // Parallel execution of independent queries
    const [totalMeetings, upcomingMeetings, taskSummary, overdueTasks] =
      await Promise.all([
        // Get total meetings count
        Meeting.countDocuments({ userId }),

        // Get upcoming meetings
        Meeting.find({
          userId,
          date: { $gte: now },
        })
          .select("title date participants _id")
          .sort({ date: 1 })
          .limit(5)
          .lean(),

        // Get task summary
        Task.aggregate([
          {
            $match: { userId },
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$status", "in-progress"] },
                  "inProgress",
                  "$status",
                ],
              },
              count: { $sum: 1 },
            },
          },
        ]),

        // Get overdue tasks with meeting info
        Task.aggregate([
          {
            $match: {
              userId,
              status: { $ne: "completed" },
              dueDate: { $lt: now },
            },
          },
          {
            $lookup: {
              from: "meetings",
              localField: "meetingId",
              foreignField: "_id",
              as: "meeting",
              pipeline: [{ $project: { title: 1 } }],
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              dueDate: 1,
              meetingId: 1,
              meetingTitle: { $arrayElemAt: ["$meeting.title", 0] },
            },
          },
        ]),
      ]);

    // Process task summary into required format
    const processedTaskSummary = taskSummary.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {
        pending: 0,
        inProgress: 0,
        completed: 0,
      }
    );

    // Format upcoming meetings to include participant count and ensure correct _id type
    const formattedUpcomingMeetings = upcomingMeetings.map((meeting) => ({
      _id: new Types.ObjectId(meeting._id.toString()),
      title: meeting.title,
      date: meeting.date,
      participantCount: meeting.participants?.length || 0,
    }));

    return {
      totalMeetings,
      taskSummary: processedTaskSummary,
      upcomingMeetings: formattedUpcomingMeetings,
      overdueTasks,
    };
  }
}
