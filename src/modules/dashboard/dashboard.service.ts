import { Service } from "typedi";
import { DashboardRepository } from "./dasboard.repository";

@Service()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(userId: string) {
    this.dashboardRepository.getDashboardData(userId);
  }
}
