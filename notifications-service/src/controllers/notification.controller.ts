import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear una nueva notificación',
    description: 'Crea una nueva notificación para un usuario específico. La notificación se enviará automáticamente por WebSocket si está configurado.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificación creada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos o límite de notificaciones excedido'
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener notificaciones del usuario',
    description: 'Obtiene las notificaciones del usuario autenticado con filtros opcionales y paginación.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificaciones obtenidas exitosamente'
  })
  async findAll(@Request() req, @Query() filters: NotificationFiltersDto) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.findAll(userId, filters);
  }

  @Get('unread')
  @ApiOperation({ 
    summary: 'Obtener notificaciones no leídas',
    description: 'Obtiene todas las notificaciones no leídas del usuario autenticado. Resultado puede venir desde cache para mejor rendimiento.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificaciones no leídas obtenidas exitosamente'
  })
  async findUnread(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.findUnread(userId);
  }

  @Get('unread/count')
  @ApiOperation({ 
    summary: 'Obtener contador de notificaciones no leídas',
    description: 'Obtiene el número total de notificaciones no leídas del usuario autenticado.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contador obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  async getUnreadCount(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener notificación específica',
    description: 'Obtiene una notificación específica por su ID. Solo el propietario puede acceder a sus notificaciones.'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación encontrada'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificación no encontrada'
  })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar notificación',
    description: 'Actualiza una notificación específica. Principalmente usado para marcar como leída/no leída.'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación actualizada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificación no encontrada'
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req
  ) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.update(id, userId, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @ApiOperation({ 
    summary: 'Marcar notificación como leída',
    description: 'Marca una notificación específica como leída y actualiza la fecha de lectura.'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación marcada como leída'
  })
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.update(id, userId, { isRead: true, readAt: new Date() });
  }

  @Post('mark-read')
  @ApiOperation({ 
    summary: 'Marcar múltiples notificaciones como leídas',
    description: 'Marca múltiples notificaciones como leídas en una sola operación. Si no se especifican IDs, marca todas las no leídas.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificaciones marcadas como leídas',
    schema: {
      type: 'object',
      properties: {
        marked: { type: 'number', example: 3 }
      }
    }
  })
  async markMultipleAsRead(@Body() markAsReadDto: MarkAsReadDto, @Request() req) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.markAsRead(userId, markAsReadDto);
  }

  @Post('mark-all-read')
  @ApiOperation({ 
    summary: 'Marcar todas las notificaciones como leídas',
    description: 'Marca todas las notificaciones no leídas del usuario como leídas.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todas las notificaciones marcadas como leídas',
    schema: {
      type: 'object',
      properties: {
        marked: { type: 'number', example: 10 }
      }
    }
  })
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar notificación',
    description: 'Elimina una notificación específica. Solo el propietario puede eliminar sus notificaciones.'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación eliminada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificación no encontrada'
  })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.id;
    await this.notificationService.remove(id, userId);
    return { message: 'Notificación eliminada exitosamente' };
  }

  @Post('cleanup')
  @ApiOperation({ 
    summary: 'Limpiar notificaciones expiradas',
    description: 'Elimina todas las notificaciones que han pasado su fecha de expiración. Endpoint administrativo.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificaciones expiradas eliminadas',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', example: 25 }
      }
    }
  })
  async cleanupExpired() {
    return await this.notificationService.cleanupExpiredNotifications();
  }
} 