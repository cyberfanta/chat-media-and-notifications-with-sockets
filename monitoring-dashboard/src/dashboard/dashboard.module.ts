import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ConfigModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], // Exportamos el servicio para otros módulos
})
export class DashboardModule {} 