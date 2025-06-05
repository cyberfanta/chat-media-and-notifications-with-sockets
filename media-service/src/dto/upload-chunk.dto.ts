import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadChunkDto {
  @ApiProperty({
    description: 'Número del chunk (empezando desde 0)',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  chunkNumber: number;

  @ApiProperty({
    description: 'Archivo chunk',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
} 