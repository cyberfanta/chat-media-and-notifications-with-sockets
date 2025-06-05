import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PromoteUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del usuario a promover a moderador',
  })
  @IsUUID(4, { message: 'Debe ser un UUID válido' })
  userId: string;
} 