import { Request, Response } from "express";
import { Service } from "typedi";
import { TasksService } from "./tasks.service";
import { logger } from "../../utils";

@Service()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  async getTasks(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const tasks = await this.tasksService.getTasks(userId);
      res.json(tasks);
    } catch (err) {
      logger.error("Error fetching tasks", { userId: req.userId, error: err });
      res.status(500).json({ error: "Error fetching tasks" });
    }
  }
}
