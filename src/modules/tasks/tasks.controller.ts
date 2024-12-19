import { Request, Response } from "express";
import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { TasksService } from "./tasks.service";
import { logger } from "@/utils";

@Service()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly authService: AuthService
  ) {}

  async getTasks(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const tasks = await this.tasksService.getTasks(userId);
      res.json(tasks);
    } catch (err) {
      logger.error("Error fetching tasks", { userId: req.userId, error: err });
      res.status(500).json({ error: "Error fetching tasks" });
    }
  }
}
