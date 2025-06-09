import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [StatsController],
})
export class StatsModule {} 