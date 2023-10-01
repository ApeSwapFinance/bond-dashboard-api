import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedirectModule } from './redirect/redirect.module';
import { CollectorModule } from './collector/collector.module';

@Module({
  imports: [DashboardModule, CollectorModule, RedirectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
