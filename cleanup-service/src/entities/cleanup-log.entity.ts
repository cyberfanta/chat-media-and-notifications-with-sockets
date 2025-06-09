import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum CleanupType {
  CHUNKS = 'chunks',
  UPLOADS = 'uploads',
  TEMP_FILES = 'temp_files',
  STORAGE_MONITORING = 'storage_monitoring',
}

export enum CleanupStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

@Entity('cleanup_logs')
@Index(['type', 'status'])
@Index(['createdAt'])
export class CleanupLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: CleanupType,
  })
  type: CleanupType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CleanupStatus,
  })
  status: CleanupStatus;

  @Column({ name: 'items_processed', type: 'integer', default: 0 })
  itemsProcessed: number;

  @Column({ name: 'items_deleted', type: 'integer', default: 0 })
  itemsDeleted: number;

  @Column({ name: 'space_freed_bytes', type: 'bigint', default: 0 })
  spaceFreedBytes: number;

  @Column({ name: 'execution_time_ms', type: 'integer' })
  executionTimeMs: number;

  @Column({ name: 'details', type: 'jsonb', nullable: true })
  details?: any;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Métodos auxiliares
  get isSuccess(): boolean {
    return this.status === CleanupStatus.SUCCESS;
  }

  get spaceFreedMB(): number {
    return Math.round(this.spaceFreedBytes / 1024 / 1024);
  }

  get executionTimeSeconds(): number {
    return Math.round(this.executionTimeMs / 1000);
  }
} 