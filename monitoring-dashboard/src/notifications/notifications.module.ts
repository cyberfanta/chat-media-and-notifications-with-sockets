import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {} 