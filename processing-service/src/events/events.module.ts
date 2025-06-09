import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsService } from './events.service';
import { NotificationPublisher } from './notification-publisher.service';

@Module({
  providers: [EventsService, NotificationPublisher],
  exports: [EventsService, NotificationPublisher],
})
export class EventsModule {} 