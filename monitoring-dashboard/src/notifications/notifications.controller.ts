import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { DashboardService } from '../dashboard/dashboard.service';

@ApiTags('notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones recientes del sistema' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de notificaciones a devolver (por defecto: 50)',
    example: 20
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filtrar por tipo de notificación',
    enum: ['processing_started', 'processing_progress', 'processing_completed', 'processing_failed', 'media_available_public', 'media_quality_analysis']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de notificaciones del sistema',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'ID único de la notificación' },
              type: { type: 'string', description: 'Tipo de notificación' },
              title: { type: 'string', description: 'Título de la notificación' },
              message: { type: 'string', description: 'Mensaje de la notificación' },
              data: { type: 'object', description: 'Datos adicionales' },
              isRead: { type: 'boolean', description: 'Si la notificación fue leída' },
              createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación' },
              userId: { type: 'string', description: 'ID del usuario relacionado' }
            }
          }
        },
        total: { type: 'number', description: 'Total de notificaciones disponibles' },
        unread: { type: 'number', description: 'Número de notificaciones no leídas' }
      }
    }
  })
  async getNotifications(
    @Query('limit') limit?: number,
    @Query('type') type?: string
  ) {
    const notifications = await this.dashboardService.getRecentNotifications();
    
    // Aplicar filtros si se proporcionan
    let filteredNotifications = notifications;
    
    if (type) {
      filteredNotifications = notifications.filter(n => n.type === type);
    }
    
    if (limit) {
      filteredNotifications = filteredNotifications.slice(0, limit);
    }
    
    return { 
      notifications: filteredNotifications,
      total: notifications.length,
      unread: filteredNotifications.length // Simplificado: consideramos todas como no leídas por ahora
    };
  }
} 