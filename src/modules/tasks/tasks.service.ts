import { Types } from "mongoose";
import { Service } from "typedi";
import { ITask } from "./tasks.model";
import { TasksRepository } from "./tasks.repository";

@Service()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async getTasks(userId: string): Promise<ITask[]> {
    return this.tasksRepository.getAll({ userId });
  }

  async createTask(
    userId: string,
    meetingId: Types.ObjectId,
    title: string,
    dueDate: Date
  ): Promise<ITask> {
    return this.tasksRepository.createTask({
      userId,
      meetingId,
      title,
      dueDate,
    });
  }

  async createTasksFromActionItems(
    userId: string,
    meetingId: string,
    actionItems: string[]
  ) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Set due date to 1 week from now

    const tasks = actionItems.map((item) => ({
      userId,
      meetingId,
      title: item,
      dueDate,
    }));

    return this.tasksRepository.batchCreateTasks(tasks);
  }

  async updateTaskStatus(
    taskId: string,
    status: ITask["status"]
  ): Promise<ITask | null> {
    return this.tasksRepository.updateTaskStatus(taskId, status);
  }
}
