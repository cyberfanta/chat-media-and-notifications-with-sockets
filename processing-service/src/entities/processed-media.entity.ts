import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface CompressionMetadata {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  quality: number;
  format: string;
}

export interface ThumbnailMetadata {
  count: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  paths: string[];
}

@Entity('processed_media')
@Index(['originalMediaId', 'status'])
@Index(['mediaType', 'status'])
@Index(['createdAt'])
export class ProcessedMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_media_id', type: 'uuid' })
  @Index()
  originalMediaId: string;

  @Column({ name: 'uploader_id', type: 'uuid' })
  @Index()
  uploaderId: string;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: MediaType,
  })
  mediaType: MediaType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ name: 'original_path', type: 'text' })
  originalPath: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename: string;

  @Column({ name: 'original_size', type: 'bigint' })
  originalSize: number;

  @Column({ name: 'original_mime_type', type: 'varchar', length: 100 })
  originalMimeType: string;

  // Archivos comprimidos
  @Column({ name: 'compressed_path', type: 'text', nullable: true })
  compressedPath?: string;

  @Column({ name: 'compressed_size', type: 'bigint', nullable: true })
  compressedSize?: number;

  @Column({ name: 'compression_metadata', type: 'jsonb', nullable: true })
  compressionMetadata?: CompressionMetadata;

  // Thumbnails
  @Column({ name: 'thumbnail_metadata', type: 'jsonb', nullable: true })
  thumbnailMetadata?: ThumbnailMetadata;

  // Información de procesamiento
  @Column({ name: 'processing_started_at', type: 'timestamp', nullable: true })
  processingStartedAt?: Date;

  @Column({ name: 'processing_completed_at', type: 'timestamp', nullable: true })
  processingCompletedAt?: Date;

  @Column({ name: 'processing_duration_ms', type: 'integer', nullable: true })
  processingDurationMs?: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'processing_queue_job_id', type: 'varchar', nullable: true })
  processingQueueJobId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos auxiliares
  get isProcessing(): boolean {
    return this.status === ProcessingStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.status === ProcessingStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === ProcessingStatus.FAILED;
  }

  get compressionRatio(): number | null {
    if (!this.compressionMetadata) return null;
    return this.compressionMetadata.compressionRatio;
  }

  get thumbnailCount(): number {
    if (!this.thumbnailMetadata) return 0;
    return this.thumbnailMetadata.count;
  }
} 