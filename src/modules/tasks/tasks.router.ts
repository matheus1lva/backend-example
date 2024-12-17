import { Router } from "express";
import { Container } from "typedi";
import { TasksController } from "./tasks.controller";

const router = Router();
const tasksController = Container.get(TasksController);

router.get("/", (req, res) => tasksController.getTasks(req, res));

export { router as taskRoutes };
