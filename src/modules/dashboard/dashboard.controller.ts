import { httpErrors } from "@/utils";
import type { Request, Response } from "express";
import { Service } from "typedi";
import { DashboardService } from "./dashboard.service";

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
      throw new httpErrors.InternalServerError("Error fetching dashboard data");
    }
  }
}
