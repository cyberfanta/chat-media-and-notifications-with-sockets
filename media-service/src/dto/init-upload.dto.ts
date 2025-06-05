import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../entities/media.entity';

export class InitUploadDto {
  @ApiProperty({
    description: 'Nombre original del archivo',
    example: 'video_ejemplo.mp4',
  })
  @IsNotEmpty()
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'video/mp4',
  })
  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'Tipo de media a subir',
    enum: MediaType,
    example: MediaType.VIDEO,
  })
  @IsNotEmpty()
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'Tamaño total del archivo en bytes',
    example: 104857600,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalSize: number;

  @ApiProperty({
    description: 'Número total de chunks',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalChunks: number;
} 