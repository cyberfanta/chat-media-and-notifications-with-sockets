import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Marcar notificación como leída/no leída' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de lectura de la notificación' })
  @IsOptional()
  @IsDateString()
  readAt?: Date;
}

export class MarkAsReadDto {
  @ApiPropertyOptional({ description: 'Lista de IDs de notificaciones a marcar como leídas' })
  @IsOptional()
  notificationIds?: string[];
} 