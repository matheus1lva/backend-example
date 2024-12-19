import { ITask, Task } from "@/modules/tasks/tasks.model";
import { CreateTask } from "@/modules/tasks/types/create-task.type";
import { Service } from "typedi";

@Service()
export class TasksRepository {
  getAll({ userId }: { userId: string }): ITask[] | PromiseLike<ITask[]> {
    return Task.find({ userId });
  }
  createTask(input: Partial<ITask>) {
    const task = new Task(input);
    return task.save();
  }

  batchCreateTasks(tasks: CreateTask[]) {
    return Task.insertMany(tasks);
  }

  updateTaskStatus(taskId: string, status: ITask["status"]) {
    return Task.findByIdAndUpdate(taskId, { status }, { new: true });
  }

  getTaskStats(userId: string) {
    return Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
  }

  async getOverdueTasks(userId: string) {
    return await Task.aggregate([
      {
        $match: {
          userId,
          dueDate: { $lt: new Date() },
          status: { $ne: "completed" },
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
      { $unwind: "$meeting" },
      {
        $project: {
          _id: 1,
          title: 1,
          dueDate: 1,
          meetingId: "$meeting._id",
          meetingTitle: "$meeting.title",
        },
      },
      {
        $sort: {
          dueDate: 1,
        },
      },
    ]);
  }

  async getGroupedTasksByStatus(userId: string): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
  }> {
    const groupedStatuses = await Task.aggregate<{
      _id: ITask["status"];
      count: number;
    }>([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return groupedStatuses.reduce(
      (acc, group) => {
        if (group._id === "in-progress") {
          acc.inProgress = group.count;
        } else {
          acc[group._id] = group.count;
        }
        return acc;
      },
      {
        pending: 0,
        inProgress: 0,
        completed: 0,
      }
    );
  }
}
