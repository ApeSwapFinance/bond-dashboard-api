import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('checkServer/:ip')
  async checkServer(@Param('ip') ip: string) {
    return await this.dashboardService.checkServer(ip);
  }

  @Get('checkAllServers')
  async checkAllServers() {
    return await this.dashboardService.checkAllServers();
  }
}
