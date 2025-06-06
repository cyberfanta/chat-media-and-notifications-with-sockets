import { IsString, IsUUID, IsEnum, IsOptional, IsArray, IsObject, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority, NotificationChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario que recibirá la notificación' })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    enum: NotificationType, 
    description: 'Tipo de notificación',
    example: NotificationType.NEW_COMMENT
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Título de la notificación' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mensaje de la notificación' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Datos adicionales de la notificación' })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiPropertyOptional({ 
    enum: NotificationPriority, 
    description: 'Prioridad de la notificación',
    default: NotificationPriority.MEDIUM
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ 
    enum: NotificationChannel,
    isArray: true,
    description: 'Canales por los que enviar la notificación',
    example: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Fecha de expiración de la notificación' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'ID de la entidad relacionada' })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({ description: 'Tipo de la entidad relacionada' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;
} 