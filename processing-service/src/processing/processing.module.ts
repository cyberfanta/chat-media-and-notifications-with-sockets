import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ProcessingService } from './processing.service';
import { ProcessingController } from './processing.controller';
import { ProcessedMedia } from '../entities/processed-media.entity';
import { ProcessingJob } from '../entities/processing-job.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessedMedia, ProcessingJob]),
    ConfigModule,
    EventsModule,
  ],
  controllers: [ProcessingController],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {} 