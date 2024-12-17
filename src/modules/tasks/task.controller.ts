import type { AuthenticatedRequest } from "@/middlewares";
import type { Response } from "express";
import { Service } from "typedi";
import { TaskService } from "./task.service";

@Service()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const tasks = await this.taskService.getTasks(req.userId);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async getTaskById(req: AuthenticatedRequest, res: Response) {
    try {
      const task = await this.taskService.getTaskById(
        req.userId,
        req.params.id
      );
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const task = await this.taskService.createTask(req.userId, req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async updateTaskStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const task = await this.taskService.updateTaskStatus(
        req.userId,
        req.params.id,
        req.body.status
      );
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }
}
