import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [QueueController],
})
export class QueueModule {} 