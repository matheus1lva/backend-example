import { Meeting } from "@/modules/meetings/meetings.model";
import { Service } from "typedi";
import { DashboardData } from "./types";

@Service()
export class DashboardRepository {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();

    const [dashboardData] = await Meeting.aggregate([
      { $match: { userId } },
      {
        $facet: {
          upcomingMeetings: [
            {
              $match: {
                date: { $gte: now },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                date: 1,
                participantCount: { $size: "$participants" },
              },
            },
            { $sort: { date: 1 } },
            { $limit: 5 },
          ],
          totalMeetings: [{ $count: "count" }],
          taskSummary: [
            {
              $lookup: {
                from: "tasks",
                let: { user_id: "$userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$userId", "$$user_id"] },
                    },
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
                ],
                as: "taskSummary",
              },
            },
            {
              $project: {
                _id: 0,
                pending: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$taskSummary",
                            cond: { $eq: ["$$this._id", "pending"] },
                          },
                        },
                        0,
                      ],
                    },
                    { count: 0 },
                  ],
                },
                inProgress: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$taskSummary",
                            cond: { $eq: ["$$this._id", "inProgress"] },
                          },
                        },
                        0,
                      ],
                    },
                    { count: 0 },
                  ],
                },
                completed: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$taskSummary",
                            cond: { $eq: ["$$this._id", "completed"] },
                          },
                        },
                        0,
                      ],
                    },
                    { count: 0 },
                  ],
                },
              },
            },
          ],
          overdueTasks: [
            {
              $lookup: {
                from: "tasks",
                let: { user_id: "$userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$userId", "$$user_id"] },
                          { $ne: ["$status", "completed"] },
                          { $lt: ["$dueDate", now] },
                        ],
                      },
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
                ],
                as: "overdueTasks",
              },
            },
            {
              $unwind: {
                path: "$overdueTasks",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $replaceRoot: { newRoot: "$overdueTasks" } },
          ],
        },
      },
    ]).allowDiskUse(true);

    return {
      totalMeetings: dashboardData.totalMeetings?.[0]?.count || 0,
      taskSummary: dashboardData.taskSummary?.[0] || {
        pending: 0,
        inProgress: 0,
        completed: 0,
      },
      upcomingMeetings: dashboardData.upcomingMeetings || [],
      overdueTasks: dashboardData.overdueTasks || [],
    };
  }
}
