import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './controllers/media.controller';
import { HealthController } from './controllers/health.controller';
import { MediaService } from './services/media.service';
import { CommentsService } from './services/comments.service';
import { AuthService } from './auth/auth.service';
import { RedisModule } from './redis/redis.module';
import { Media } from './entities/media.entity';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Media]),
    RedisModule,
  ],
  controllers: [MediaController, HealthController],
  providers: [MediaService, CommentsService, AuthService],
})
export class AppModule {} 