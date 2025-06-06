import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entities
import { Notification } from './entities/notification.entity';

// Services
import { NotificationService } from './services/notification.service';
import { EventListenerService } from './services/event-listener.service';

// Controllers
import { NotificationController } from './controllers/notification.controller';
import { HealthController } from './controllers/health.controller';

// Gateways
import { NotificationGateway } from './gateways/notification.gateway';

// Config
import { RedisConfig } from './config/redis.config';

// Auth
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5434),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'admin123'),
        database: configService.get<string>('DB_NAME', 'postgres_notifications'),
        entities: [Notification],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: configService.get<boolean>('DB_SSL', false),
      }),
      inject: [ConfigService],
    }),

    // Entidades TypeORM
    TypeOrmModule.forFeature([Notification]),

    // JWT Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),

    // Passport para autenticación
    PassportModule,
  ],
  controllers: [
    NotificationController,
    HealthController,
  ],
  providers: [
    NotificationService,
    EventListenerService,
    NotificationGateway,
    RedisConfig,
    JwtAuthGuard,
  ],
  exports: [
    NotificationService,
    RedisConfig,
  ],
})
export class AppModule {} 