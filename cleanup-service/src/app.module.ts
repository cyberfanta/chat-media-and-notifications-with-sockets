import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Módulos de la aplicación
import { CleanupModule } from './cleanup/cleanup.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';

// Entidades
import { CleanupLog } from './entities/cleanup-log.entity';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos principal
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5437),
        username: configService.get('DB_USERNAME', 'admin'),
        password: configService.get('DB_PASSWORD', 'admin123'),
        database: configService.get('DB_NAME', 'cleanup_db'),
        entities: [CleanupLog],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),

    // Scheduler para jobs automáticos
    ScheduleModule.forRoot(),

    // Módulos de funcionalidad
    CleanupModule,
    StorageModule,
    HealthModule,
  ],
})
export class AppModule {} 