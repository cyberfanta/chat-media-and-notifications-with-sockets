import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'comments_db',
  entities: [Comment],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}; 