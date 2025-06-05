import { IsString, IsNotEmpty, IsUUID, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'Este video está increíble, me encanta la calidad.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, {
    message: 'El comentario debe tener entre 1 y 1000 caracteres',
  })
  content: string;

  @ApiProperty({
    description: 'ID del contenido multimedia al que se comenta',
    example: 'abc123-def456-ghi789',
  })
  @IsUUID('all', { message: 'contentId debe ser un UUID válido' })
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({
    description: 'ID del comentario padre (para respuestas)',
    example: 'parent-comment-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('all', { message: 'parentId debe ser un UUID válido' })
  parentId?: string;
} 