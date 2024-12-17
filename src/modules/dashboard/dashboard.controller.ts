import { AuthService } from "@/modules/auth/auth.service";
import type { Request, Response } from "express";
import { Service } from "typedi";
import { DashboardService } from "./dashboard.service";

@Service()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService
  ) {}

  async getDashboard(req: Request, res: Response) {
    const { userId } = this.authService.verifyToken(
      req.headers.authorization as string
    );

    try {
      const dashboardData = await this.dashboardService.getDashboardData(
        userId
      );
      res.json(dashboardData);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }
}
