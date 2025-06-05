import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MediaController } from './controllers/media.controller';
import { HealthController } from './controllers/health.controller';
import { MediaService } from './services/media.service';
import { Media } from './entities/media.entity';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Media]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mi_super_secreto_jwt_para_autenticacion_2024',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [MediaController, HealthController],
  providers: [MediaService],
})
export class AppModule {} 