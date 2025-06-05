import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Nuevo contenido del comentario',
    example: 'Este video está increíble, me encanta la calidad. [Editado]',
    minLength: 1,
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, {
    message: 'El comentario debe tener entre 1 y 1000 caracteres',
  })
  content?: string;
} 