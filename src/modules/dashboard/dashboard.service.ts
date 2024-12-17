import { Meeting } from "@/modules/meetings/meetings.model";
import { Task } from "@/modules/tasks/tasks.model";
import { Service } from "typedi";
import type { DashboardData } from "./types";

@Service()
export class DashboardService {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();

    const [upcomingMeetings, totalMeetings, taskStats, overdueTasks] =
      await Promise.all([
        Meeting.find({
          userId,
          date: { $gte: now },
        })
          .sort({ date: 1 })
          .limit(5)
          .select("_id title date participants")
          .lean(),

        Meeting.countDocuments({ userId }),

        Task.aggregate([
          { $match: { userId: userId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        Task.aggregate([
          {
            $match: {
              userId: userId,
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

    // Convert task stats array to object
    const taskSummary = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      ...Object.fromEntries(
        taskStats.map(({ _id, count }) => [
          _id === "in-progress" ? "inProgress" : _id,
          count,
        ])
      ),
    };

    return {
      totalMeetings,
      taskSummary,
      upcomingMeetings: upcomingMeetings.map((meeting) => ({
        _id: meeting._id,
        title: meeting.title,
        date: meeting.date,
        participantCount: meeting.participants.length,
      })),
      overdueTasks,
    };
  }
}
