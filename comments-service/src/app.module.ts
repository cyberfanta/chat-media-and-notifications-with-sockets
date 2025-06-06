import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { Comment } from './entities/comment.entity';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Comment]),
    RedisModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    AuthService,
    JwtAuthGuard,
  ],
  exports: [CommentsService], // Para usar en otros módulos si es necesario
})
export class AppModule {} 