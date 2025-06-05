import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  contentId: string; // ID del contenido multimedia (media-service)

  @Column({ type: 'uuid' })
  userId: string; // ID del usuario que comentó

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string; // Email del usuario (para referencias)

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status: CommentStatus;

  @Column({ type: 'text', nullable: true })
  moderationReason: string; // Razón de moderación (si fue rechazado)

  @Column({ type: 'uuid', nullable: true })
  moderatedBy: string; // ID del moderador

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt: Date; // Fecha de moderación

  @Column({ type: 'int', default: 0 })
  likes: number; // Contador de likes

  @Column({ type: 'int', default: 0 })
  dislikes: number; // Contador de dislikes

  @Column({ type: 'uuid', nullable: true })
  parentId: string; // Para respuestas a comentarios (opcional)

  @Column({ type: 'boolean', default: false })
  isEdited: boolean; // Si el comentario fue editado

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados (no se guardan en BD)
  get isModerated(): boolean {
    return this.status !== CommentStatus.PENDING;
  }

  get isVisible(): boolean {
    return this.status === CommentStatus.APPROVED;
  }

  get totalReactions(): number {
    return this.likes + this.dislikes;
  }
} 