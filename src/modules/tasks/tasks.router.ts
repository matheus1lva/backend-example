import { Router } from "express";
import { Container } from "typedi";
import { TasksController } from "./tasks.controller";

const router = Router();
const tasksController = Container.get(TasksController);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of tasks for the authenticated user
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   meetingId:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get("/", (req, res) => tasksController.getTasks(req, res));

export { router as taskRoutes };
