import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Módulos de la aplicación
import { ProcessingModule } from './processing/processing.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';

// Controladores adicionales
import { QueueController } from './queue/queue.controller';
import { StatsController } from './stats/stats.controller';

// Entidades
import { ProcessedMedia } from './entities/processed-media.entity';
import { ProcessingJob } from './entities/processing-job.entity';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5436),
        username: configService.get('DB_USERNAME', 'processing_user'),
        password: configService.get('DB_PASSWORD', 'processing_password'),
        database: configService.get('DB_NAME', 'processing_db'),
        entities: [ProcessedMedia, ProcessingJob],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),



    // Event Emitter
    EventEmitterModule.forRoot({
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Módulos de funcionalidad
    ProcessingModule,
    EventsModule,
    HealthModule,
  ],
  controllers: [
    QueueController,
    StatsController,
  ],
})
export class AppModule {} 