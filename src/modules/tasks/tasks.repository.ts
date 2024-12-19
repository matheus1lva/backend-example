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

  getOverdueTasksCount(userId: string) {
    return Task.countDocuments({
      userId,
      status: "pending",
      dueDate: { $lt: new Date() },
    });
  }
}
