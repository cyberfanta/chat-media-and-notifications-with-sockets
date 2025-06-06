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
  Res,
  StreamableFile,
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
import { Response } from 'express';
import { MediaService } from '../services/media.service';
import { InitUploadDto } from '../dto/init-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Media } from '../entities/media.entity';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
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
  @ApiBody({
    required: false,
    description: 'Cuerpo vacío - no se requieren datos adicionales',
    schema: {
      type: 'object',
      properties: {},
    },
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
    summary: 'Eliminar archivo multimedia',
    description: 'Elimina un archivo multimedia y todos sus recursos asociados',
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
    // Extraer token del header para pasarlo al comments-service
    const token = req.headers.authorization?.split(' ')[1];
    await this.mediaService.deleteMedia(id, req.user.sub, token);
    return { message: 'Media eliminado exitosamente' };
  }

  @Post('split-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Dividir archivo en chunks (Testing)',
    description: 'Divide un archivo en la cantidad especificada de chunks para testing de upload-chunk',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a dividir',
        },
        chunks: {
          type: 'number',
          description: 'Número de chunks en que dividir el archivo',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo dividido exitosamente',
    schema: {
      type: 'object',
      properties: {
        originalName: { type: 'string' },
        originalSize: { type: 'number' },
        totalChunks: { type: 'number' },
        chunkSize: { type: 'number' },
        chunks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              chunkNumber: { type: 'number' },
              size: { type: 'number' },
              data: { type: 'string', description: 'Base64 encoded chunk data' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo o número de chunks inválido',
  })
  async splitFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('chunks') chunks: string,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const numChunks = parseInt(chunks);
    if (isNaN(numChunks) || numChunks <= 0 || numChunks > 1000) {
      throw new BadRequestException('Número de chunks inválido (debe ser entre 1 y 1000)');
    }

    return await this.mediaService.splitFileForTesting(file, numChunks);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Descargar archivo multimedia',
    description: 'Descarga el archivo multimedia completado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del media a descargar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado exitosamente',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo no está disponible (aún procesando)',
  })
  async downloadFile(
    @Param('id') id: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, media } = await this.mediaService.getFileStream(id, req.user.sub);
    
    res.set({
      'Content-Type': media.mimeType,
      'Content-Disposition': `attachment; filename="${media.originalName}"`,
      'Content-Length': media.totalSize.toString(),
    });

    return new StreamableFile(stream);
  }

  @Get(':id/view')
  @ApiOperation({
    summary: 'Ver archivo multimedia en el navegador',
    description: 'Visualiza el archivo multimedia directamente en el navegador',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del media a visualizar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo mostrado exitosamente',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'video/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'audio/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async viewFile(
    @Param('id') id: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, media } = await this.mediaService.getFileStream(id, req.user.sub);
    
    res.set({
      'Content-Type': media.mimeType,
      'Content-Disposition': `inline; filename="${media.originalName}"`,
      'Content-Length': media.totalSize.toString(),
    });

    return new StreamableFile(stream);
  }

  @Get('storage/info')
  @ApiOperation({
    summary: 'Información del almacenamiento',
    description: 'Obtiene información sobre el uso del almacenamiento local',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del almacenamiento',
    schema: {
      type: 'object',
      properties: {
        uploadsDir: { type: 'string' },
        chunksDir: { type: 'string' },
        totalFiles: { type: 'number' },
        diskUsage: {
          type: 'object',
          properties: {
            uploads: {
              type: 'object',
              properties: {
                files: { type: 'number' },
                sizeBytes: { type: 'number' },
              },
            },
            chunks: {
              type: 'object',
              properties: {
                files: { type: 'number' },
                sizeBytes: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getStorageInfo() {
    return await this.mediaService.getStorageInfo();
  }
} 