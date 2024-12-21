import { DashboardController } from "./dashboard.controller";
import express, { Request } from "express";
import { Container } from "../../config/container";

const router = express.Router();
const dashboardController = Container.get(DashboardController);

router.get("/", async (req: Request, res) => {
  return dashboardController.getDashboard(req, res);
});

export { router as dashboardRoutes };
