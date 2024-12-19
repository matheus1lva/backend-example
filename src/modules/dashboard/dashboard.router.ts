import { DashboardController } from "@/modules/dashboard/dashboard.controller";
import express, { Request } from "express";
import { Container } from "@/config/container";

const router = express.Router();
const dashboardController = Container.get(DashboardController);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Retrieve dashboard statistics and data for the authenticated user
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMeetings:
 *                   type: number
 *                 totalTasks:
 *                   type: number
 *                 completedTasks:
 *                   type: number
 *                 recentMeetings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res) => {
  return dashboardController.getDashboard(req, res);
});

export { router as dashboardRoutes };
