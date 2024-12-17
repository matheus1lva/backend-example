import { Service } from "typedi";
import { Task, ITask } from "./tasks.model";

@Service()
export class TasksService {
  async getTasks(userId: string): Promise<ITask[]> {
    return Task.find({ userId });
  }

  async createTask(
    userId: string,
    meetingId: string,
    title: string,
    dueDate: Date
  ): Promise<ITask> {
    const task = new Task({
      userId,
      meetingId,
      title,
      dueDate,
    });
    return task.save();
  }

  async createTasksFromActionItems(
    userId: string,
    meetingId: string,
    actionItems: string[]
  ): Promise<ITask[]> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Set due date to 1 week from now

    const tasks = actionItems.map(
      (item) =>
        new Task({
          userId,
          meetingId,
          title: item,
          dueDate,
        })
    );

    return Task.insertMany(tasks);
  }

  async updateTaskStatus(taskId: string, status: ITask["status"]): Promise<ITask | null> {
    return Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
  }

  async getTaskStats(userId: string) {
    const [tasksByStatus, overdueTasks] = await Promise.all([
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        userId,
        status: "pending",
        dueDate: { $lt: new Date() },
      }),
    ]);

    return {
      tasksByStatus: tasksByStatus.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        { pending: 0, completed: 0, overdue: 0 }
      ),
      overdueTasks,
    };
  }
}
