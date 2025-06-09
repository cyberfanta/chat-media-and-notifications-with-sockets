import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { StatsModule } from './stats/stats.module';
import { QueueModule } from './queue/queue.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
    }),
    DashboardModule,
    HealthModule,
    StatsModule,
    QueueModule,
    NotificationsModule,
  ],
})
export class AppModule {}
 