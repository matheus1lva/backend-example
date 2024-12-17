import { Request, Response } from "express";
import { Service } from "typedi";
import { TasksService } from "./tasks.service";
import { AuthService } from "../auth/auth.service";

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
      res.status(500).json({ message: "Error fetching tasks" });
    }
  }
}
