import { Types } from "mongoose";
import { Service } from "typedi";
import { ITask } from "./tasks.model";
import { TasksRepository } from "./tasks.repository";
import { RedisService } from "../redis/redis.service";

@Service()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly redisService: RedisService
  ) {}

  async getTasks(userId: string): Promise<ITask[]> {
    const cacheKey = `tasks:${userId}`;
    const cachedData = await this.redisService.get<ITask[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const tasks = await this.tasksRepository.getAll({ userId });
    await this.redisService.set(cacheKey, tasks, 300);
    return tasks;
  }

  async createTask(
    userId: string,
    meetingId: Types.ObjectId,
    title: string,
    dueDate: Date
  ): Promise<ITask> {
    const task = await this.tasksRepository.createTask({
      userId,
      meetingId,
      title,
      dueDate,
    });

    await this.redisService.del(`tasks:${userId}`);
    await this.redisService.del(`taskStats:${userId}`);
    return task;
  }

  async createTasksFromActionItems(
    userId: string,
    meetingId: string,
    actionItems: string[]
  ) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const tasks = actionItems.map((item) => ({
      userId,
      meetingId,
      title: item,
      dueDate,
    }));

    const createdTasks = await this.tasksRepository.batchCreateTasks(tasks);
    await this.redisService.del(`tasks:${userId}`);
    await this.redisService.del(`taskStats:${userId}`);
    return createdTasks;
  }

  async updateTaskStatus(
    taskId: string,
    status: ITask["status"]
  ): Promise<ITask | null> {
    const task = await this.tasksRepository.updateTaskStatus(taskId, status);
    if (task) {
      await this.redisService.del(`tasks:${task.userId}`);
      await this.redisService.del(`taskStats:${task.userId}`);
    }
    return task;
  }

  async getTaskStats(userId: string) {
    const cacheKey = `taskStats:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const stats = await this.tasksRepository.getTaskStats(userId);
    await this.redisService.set(cacheKey, stats, 300);
    return stats;
  }
}
