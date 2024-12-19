import type { Request, Response } from "express";
import { Service } from "typedi";
import { DashboardService } from "./dashboard.service";
import { logger } from "@/utils";

@Service()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getDashboard(req: Request, res: Response) {
    const userId = req.userId;
    try {
      const dashboardData = await this.dashboardService.getDashboardData(
        userId
      );
      res.json(dashboardData);
    } catch (err) {
      console.log(err);
      logger.error("Error fetching dashboard data", { userId, error: err });
      res.status(500).json({ error: "Error fetching dashboard data" });
    }
  }
}
