import { Service } from "typedi";
import { DashboardRepository } from "./dasboard.repository";
import type { DashboardData } from "./types";

@Service()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    return this.dashboardRepository.getDashboardData(userId);
  }
}
