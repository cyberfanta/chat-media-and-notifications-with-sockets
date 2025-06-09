import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum JobType {
  COMPRESS_IMAGE = 'compress_image',
  COMPRESS_VIDEO = 'compress_video',
  COMPRESS_AUDIO = 'compress_audio',
  GENERATE_THUMBNAILS = 'generate_thumbnails',
  FULL_PROCESSING = 'full_processing',
}

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

export interface JobProgress {
  percentage: number;
  stage: string;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  estimatedTimeMs?: number;
}

export interface JobResult {
  success: boolean;
  processedMediaId?: string;
  outputPaths?: string[];
  metadata?: any;
  error?: string;
  duration?: number;
}

@Entity('processing_jobs')
@Index(['status', 'priority'])
@Index(['mediaId'])
@Index(['queueName', 'status'])
@Index(['createdAt'])
export class ProcessingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'queue_job_id', type: 'varchar', length: 100, unique: true })
  @Index()
  queueJobId: string;

  @Column({ name: 'queue_name', type: 'varchar', length: 50 })
  queueName: string;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
  })
  jobType: JobType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.WAITING,
  })
  status: JobStatus;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: JobPriority,
    default: JobPriority.NORMAL,
  })
  priority: JobPriority;

  @Column({ name: 'media_id', type: 'uuid' })
  @Index()
  mediaId: string;

  @Column({ name: 'uploader_id', type: 'uuid' })
  @Index()
  uploaderId: string;

  @Column({ name: 'input_path', type: 'text' })
  inputPath: string;

  @Column({ name: 'output_path', type: 'text', nullable: true })
  outputPath?: string;

  @Column({ name: 'job_data', type: 'jsonb' })
  jobData: any;

  @Column({ name: 'progress', type: 'jsonb', nullable: true })
  progress?: JobProgress;

  @Column({ name: 'result', type: 'jsonb', nullable: true })
  result?: JobResult;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'attempts', type: 'integer', default: 0 })
  attempts: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 3 })
  maxAttempts: number;

  @Column({ name: 'delay_ms', type: 'integer', nullable: true })
  delayMs?: number;

  @Column({ name: 'timeout_ms', type: 'integer', nullable: true })
  timeoutMs?: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos auxiliares
  get isActive(): boolean {
    return this.status === JobStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return this.status === JobStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === JobStatus.FAILED;
  }

  get isWaiting(): boolean {
    return this.status === JobStatus.WAITING;
  }

  get duration(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    return this.completedAt.getTime() - this.startedAt.getTime();
  }

  get progressPercentage(): number {
    return this.progress?.percentage || 0;
  }

  get canRetry(): boolean {
    return this.attempts < this.maxAttempts && this.isFailed;
  }
} 