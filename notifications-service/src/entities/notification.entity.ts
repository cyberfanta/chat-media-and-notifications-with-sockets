import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  // Auth Service
  USER_REGISTERED = 'user_registered',
  LOGIN_NEW_DEVICE = 'login_new_device',
  PASSWORD_CHANGED = 'password_changed',
  LOGIN_FAILED = 'login_failed',
  PROFILE_UPDATED = 'profile_updated',
  
  // Media Service
  UPLOAD_COMPLETED = 'upload_completed',
  UPLOAD_FAILED = 'upload_failed',
  MEDIA_PROCESSED = 'media_processed',
  MEDIA_DELETED = 'media_deleted',
  NEW_CONTENT = 'new_content',
  NEW_CONTENT_FOLLOWED = 'new_content_followed',
  MEDIA_REPORTED = 'media_reported',
  
  // Comments Service
  NEW_COMMENT = 'new_comment',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_MODERATED = 'comment_moderated',
  COMMENT_APPROVED = 'comment_approved',
  COMMENT_MENTION = 'comment_mention',
  
  // System
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  
  // Social
  NEW_FOLLOWER = 'new_follower',
  CONTENT_LIKED = 'content_liked',
  CONTENT_TRENDING = 'content_trending',
  MILESTONE_REACHED = 'milestone_reached'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  WEBSOCKET = 'websocket',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app'
}

@Entity('notifications')
@Index(['userId', 'createdAt'])
@Index(['userId', 'isRead'])
@Index(['type', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP]
  })
  channels: NotificationChannel[];

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: string;

  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 