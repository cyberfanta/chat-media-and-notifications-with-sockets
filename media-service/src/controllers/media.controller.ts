import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { InitUploadDto } from '../dto/init-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Media } from '../entities/media.entity';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('init-upload')
  @ApiOperation({
    summary: 'Inicializar upload de archivo multimedia',
    description: 'Crea un nuevo registro de media y devuelve el media_id para subir chunks',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload inicializado exitosamente',
    type: Media,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación requerido',
  })
  async initializeUpload(
    @Body() initUploadDto: InitUploadDto,
    @Request() req: any,
  ): Promise<Media> {
    return await this.mediaService.initializeUpload(initUploadDto, req.user.sub);
  }

  @Post('upload-chunk/:mediaId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir chunk de archivo',
    description: 'Sube una parte del archivo multimedia',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID del media obtenido en init-upload',
    type: 'string',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Chunk del archivo a subir',
        },
        chunkNumber: {
          type: 'number',
          description: 'Número del chunk (empezando desde 0)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chunk subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        uploadedChunks: { type: 'number' },
        totalChunks: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Chunk inválido o número de chunk incorrecto',
  })
  @ApiResponse({
    status: 404,
    description: 'Media no encontrado',
  })
  async uploadChunk(
    @Param('mediaId') mediaId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('chunkNumber') chunkNumber: string,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const chunkNum = parseInt(chunkNumber);
    if (isNaN(chunkNum) || chunkNum < 0) {
      throw new BadRequestException('Número de chunk inválido');
    }

    return await this.mediaService.uploadChunk(
      mediaId,
      chunkNum,
      file,
      req.user.sub,
    );
  }

  @Post('complete-upload/:mediaId')
  @ApiOperation({
    summary: 'Completar upload de archivo',
    description: 'Ensambla todos los chunks en el archivo final',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID del media',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload completado exitosamente',
    type: Media,
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan chunks o estado inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Media no encontrado',
  })
  async completeUpload(
    @Param('mediaId') mediaId: string,
    @Request() req: any,
  ): Promise<Media> {
    return await this.mediaService.completeUpload(mediaId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener información de un media',
    description: 'Obtiene los detalles de un archivo multimedia',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del media',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del media',
    type: Media,
  })
  @ApiResponse({
    status: 404,
    description: 'Media no encontrado',
  })
  async getMedia(@Param('id') id: string): Promise<Media> {
    return await this.mediaService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener medias del usuario',
    description: 'Obtiene todos los archivos multimedia del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de medias del usuario',
    type: [Media],
  })
  async getUserMedia(@Request() req: any): Promise<Media[]> {
    return await this.mediaService.findByUserId(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar media',
    description: 'Elimina un archivo multimedia y sus archivos asociados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del media a eliminar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Media eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Media no encontrado',
  })
  async deleteMedia(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.mediaService.deleteMedia(id, req.user.sub);
    return { message: 'Media eliminado exitosamente' };
  }


} 