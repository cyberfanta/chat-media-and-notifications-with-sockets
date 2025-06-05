import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum MediaStatus {
  INITIALIZING = 'initializing',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName: string;

  @Column({ type: 'varchar', length: 10 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.INITIALIZING,
  })
  status: MediaStatus;

  @Column({ type: 'bigint', nullable: true })
  totalSize: number;

  @Column({ type: 'int', default: 0 })
  uploadedChunks: number;

  @Column({ type: 'int', nullable: true })
  totalChunks: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailPath: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // Para videos y audios en segundos

  @Column({ type: 'int', nullable: true })
  width: number; // Para imágenes y videos

  @Column({ type: 'int', nullable: true })
  height: number; // Para imágenes y videos

  @Column({ type: 'uuid' })
  uploadedBy: string; // ID del usuario que subió el archivo

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 