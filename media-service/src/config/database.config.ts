import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'media_db',
  entities: [Media],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: 5,
  retryDelay: 3000,
}; 