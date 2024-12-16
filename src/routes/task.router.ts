import express from "express";
import { AuthenticatedRequest } from "../auth.middleware.js";
import { Task } from "../modules/tasks/task.js";

export const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export { router as taskRoutes };
