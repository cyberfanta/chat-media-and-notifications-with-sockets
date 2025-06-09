import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';
import { CleanupLog } from '../entities/cleanup-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CleanupLog]),
    ConfigModule,
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {} 