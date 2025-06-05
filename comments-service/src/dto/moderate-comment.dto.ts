import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '../entities/comment.entity';

export class ModerateCommentDto {
  @ApiProperty({
    description: 'Nuevo estado del comentario',
    enum: CommentStatus,
    example: CommentStatus.APPROVED,
  })
  @IsEnum(CommentStatus, {
    message: 'Status debe ser uno de: pending, approved, rejected, flagged',
  })
  status: CommentStatus;

  @ApiProperty({
    description: 'Razón de la moderación (obligatorio si se rechaza)',
    example: 'Contenido inapropiado, lenguaje ofensivo',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, {
    message: 'La razón de moderación debe tener entre 1 y 500 caracteres',
  })
  moderationReason?: string;
} 