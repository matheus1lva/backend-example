import { DashboardController } from "@/modules/dashboard/dashboard.controller";
import express, { Request } from "express";
import Container from "typedi";

const router = express.Router();
const dashboardController = Container.get(DashboardController);

router.get("/", async (req: Request, res) => {
  dashboardController.getDashboard(req, res);
});

export { router as dashboardRoutes };
