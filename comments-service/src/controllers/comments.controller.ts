import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ModerateCommentDto } from '../dto/moderate-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Comment } from '../entities/comment.entity';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('content/:contentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear comentario en contenido multimedia',
    description: 'Permite a un usuario autenticado crear un comentario en un contenido específico',
  })
  @ApiParam({
    name: 'contentId',
    description: 'ID del contenido multimedia',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente',
    type: Comment,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no válido',
  })
  async createComment(
    @Param('contentId') contentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ): Promise<Comment> {
    // Asegurar que el contentId coincida con el del DTO
    createCommentDto.contentId = contentId;
    
    return await this.commentsService.create(
      createCommentDto,
      req.user.sub,
      req.user.email,
    );
  }

  @Get('content/:contentId')
  @ApiOperation({
    summary: 'Obtener comentarios de contenido multimedia',
    description: 'Obtiene todos los comentarios de un contenido específico con paginación. Soporta paginación basada en offset (tradicional) y paginación basada en cursor (recomendada para datos en tiempo real).',
  })
  @ApiParam({
    name: 'contentId',
    description: 'ID del contenido multimedia',
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (solo para paginación offset-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiQuery({
    name: 'useCursor',
    required: false,
    description: 'Usar paginación basada en cursor para evitar inconsistencias con nuevos comentarios',
    example: true,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'ID del último comentario visto (para paginación cursor-based)',
    example: 'comment-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado',
    enum: ['pending', 'approved', 'rejected', 'flagged'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios con paginación',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/Comment' },
        },
        total: { type: 'number' },
        page: { type: 'number', description: 'Número de página actual (solo offset-based)' },
        limit: { type: 'number' },
        totalPages: { type: 'number', description: 'Total de páginas (solo offset-based)' },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' },
        nextCursor: { type: 'string', description: 'Cursor para la siguiente página (solo cursor-based)' },
        prevCursor: { type: 'string', description: 'Cursor para la página anterior (solo cursor-based)' },
        usedCursor: { type: 'boolean', description: 'Indica si se usó paginación cursor-based' },
      },
    },
  })
  async getCommentsByContent(
    @Param('contentId') contentId: string,
    @Query() query: QueryCommentsDto,
  ) {
    return await this.commentsService.findByContentId(contentId, query);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check del servicio',
    description: 'Verifica que el servicio de comentarios esté funcionando correctamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string' },
        service: { type: 'string', example: 'comments-service' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'comments-service',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener comentario por ID',
    description: 'Obtiene un comentario específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario encontrado',
    type: Comment,
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
  })
  async getComment(@Param('id') id: string): Promise<Comment> {
    return await this.commentsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar comentario',
    description: 'Permite al propietario del comentario actualizarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado exitosamente',
    type: Comment,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para editar este comentario',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
  })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any,
  ): Promise<Comment> {
    return await this.commentsService.update(id, updateCommentDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar comentario',
    description: 'Permite al propietario del comentario eliminarlo junto con sus respuestas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Comentario eliminado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar este comentario',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
  })
  async deleteComment(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.commentsService.delete(id, req.user.sub);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Moderar comentario',
    description: 'Permite a un moderador aprobar, rechazar o marcar un comentario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario a moderar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario moderado exitosamente',
    type: Comment,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de moderación inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no válido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de moderación',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
  })
  async moderateComment(
    @Param('id') id: string,
    @Body() moderateDto: ModerateCommentDto,
    @Request() req: any,
  ): Promise<Comment> {
    return await this.commentsService.moderate(id, moderateDto, req.user.sub);
  }

  @Get('moderation/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener comentarios pendientes de moderación',
    description: 'Lista todos los comentarios que requieren moderación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios pendientes',
  })
  async getPendingComments(@Query() query: QueryCommentsDto) {
    return await this.commentsService.getPendingComments(query);
  }

  @Delete('content/:contentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar todos los comentarios de un contenido',
    description: 'Elimina todos los comentarios asociados a un contenido multimedia (usado cuando se elimina el contenido)',
  })
  @ApiParam({
    name: 'contentId',
    description: 'ID del contenido multimedia',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Comentarios eliminados exitosamente',
  })
  async deleteCommentsByContent(
    @Param('contentId') contentId: string,
  ): Promise<void> {
    await this.commentsService.deleteByContentId(contentId);
  }

  @Get('stats/:contentId')
  @ApiOperation({
    summary: 'Obtener estadísticas de comentarios',
    description: 'Obtiene estadísticas de comentarios para un contenido específico',
  })
  @ApiParam({
    name: 'contentId',
    description: 'ID del contenido multimedia',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de comentarios',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        approved: { type: 'number' },
        pending: { type: 'number' },
        rejected: { type: 'number' },
        contentId: { type: 'string' },
      },
    },
  })
  async getCommentStats(@Param('contentId') contentId: string) {
    return await this.commentsService.getCommentStats(contentId);
  }

} 