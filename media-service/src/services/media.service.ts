import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaStatus, MediaType } from '../entities/media.entity';
import { InitUploadDto } from '../dto/init-upload.dto';
import { CommentsService } from './comments.service';
import { RedisService } from '../redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';

@Injectable()
export class MediaService {
  private readonly uploadsDir = 'uploads';
  private readonly chunksDir = 'chunks';

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private commentsService: CommentsService,
    private redisService: RedisService,
  ) {
    // Crear directorios si no existen
    this.ensureDirectoryExists(this.uploadsDir);
    this.ensureDirectoryExists(this.chunksDir);
  }

  async initializeUpload(initDto: InitUploadDto, userId: string): Promise<Media> {
    // Validar tipo MIME
    if (!this.isValidMimeType(initDto.mimeType, initDto.type)) {
      throw new BadRequestException(
        `Tipo MIME ${initDto.mimeType} no válido para ${initDto.type}`,
      );
    }

    const media = this.mediaRepository.create({
      originalName: initDto.originalName,
      mimeType: initDto.mimeType,
      type: initDto.type,
      totalSize: initDto.totalSize,
      totalChunks: initDto.totalChunks,
      uploadedBy: userId,
      status: MediaStatus.INITIALIZING,
    });

    const savedMedia = await this.mediaRepository.save(media);

    // Crear directorio específico para los chunks de este archivo
    const chunkDir = path.join(this.chunksDir, savedMedia.id);
    this.ensureDirectoryExists(chunkDir);

    // Actualizar status a UPLOADING
    savedMedia.status = MediaStatus.UPLOADING;
    await this.mediaRepository.save(savedMedia);

    return savedMedia;
  }

  async uploadChunk(
    mediaId: string,
    chunkNumber: number,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ success: boolean; uploadedChunks: number; totalChunks: number }> {
    const media = await this.findMediaByIdAndUser(mediaId, userId);

    if (media.status !== MediaStatus.UPLOADING) {
      throw new BadRequestException(
        `No se puede subir chunk. Estado actual: ${media.status}`,
      );
    }

    if (chunkNumber >= media.totalChunks) {
      throw new BadRequestException(
        `Número de chunk inválido: ${chunkNumber}. Máximo: ${media.totalChunks - 1}`,
      );
    }

    try {
      // Guardar chunk
      const chunkDir = path.join(this.chunksDir, mediaId);
      const chunkPath = path.join(chunkDir, `chunk_${chunkNumber}`);
      
      // Verificar si el chunk ya existe
      const chunkExists = fs.existsSync(chunkPath);
      
      await fs.promises.writeFile(chunkPath, file.buffer);

      // Actualizar contador de chunks subidos
      const currentUploadedChunks = await this.countUploadedChunks(mediaId);
      media.uploadedChunks = currentUploadedChunks;
      
      console.log(`📦 Chunk ${chunkNumber} guardado para media ${mediaId}. Chunks totales: ${currentUploadedChunks}/${media.totalChunks}`);
      
      await this.mediaRepository.save(media);

      return {
        success: true,
        uploadedChunks: media.uploadedChunks,
        totalChunks: media.totalChunks,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al guardar chunk: ${error.message}`,
      );
    }
  }

  async completeUpload(mediaId: string, userId: string): Promise<Media> {
    const media = await this.findMediaByIdAndUser(mediaId, userId);

    console.log(`🔄 Intentando completar upload para media ${mediaId}:`);
    console.log(`   - Estado actual: ${media.status}`);
    console.log(`   - Chunks en BD: ${media.uploadedChunks}/${media.totalChunks}`);

    if (media.status !== MediaStatus.UPLOADING && media.status !== MediaStatus.PROCESSING) {
      throw new BadRequestException(
        `No se puede completar upload. Estado actual: ${media.status}`,
      );
    }

    const uploadedChunks = await this.countUploadedChunks(mediaId);
    console.log(`   - Chunks en disco: ${uploadedChunks}/${media.totalChunks}`);
    
    if (uploadedChunks !== media.totalChunks) {
      throw new BadRequestException(
        `Faltan chunks. Subidos: ${uploadedChunks}, Esperados: ${media.totalChunks}`,
      );
    }

    try {
      // Cambiar estado a PROCESSING si no está ya en processing
      if (media.status !== MediaStatus.PROCESSING) {
        media.status = MediaStatus.PROCESSING;
        await this.mediaRepository.save(media);
      }

      // Ensamblar archivo si no existe ya
      let finalFilePath = media.filePath;
      if (!finalFilePath || !fs.existsSync(finalFilePath)) {
        finalFilePath = await this.assembleFile(media);
      } else {
        console.log(`📁 Archivo ya existe en: ${finalFilePath}`);
      }
      
      // Actualizar información del archivo
      media.fileName = path.basename(finalFilePath);
      media.filePath = finalFilePath;
      media.status = MediaStatus.COMPLETED;

      // Limpiar chunks
      await this.cleanupChunks(mediaId);

      const savedMedia = await this.mediaRepository.save(media);

      // Publicar evento de upload completado para notificaciones
      await this.redisService.publishNotificationEvent('upload_completed', {
        mediaId: savedMedia.id,
        userId: savedMedia.uploadedBy,
        fileName: savedMedia.originalName,
        fileSize: savedMedia.totalSize,
        mediaType: savedMedia.type,
        completedAt: new Date().toISOString()
      });

      console.log(`✅ Upload completado exitosamente para media ${mediaId}`);
      console.log(`   - Estado final: ${savedMedia.status}`);
      console.log(`   - Archivo guardado en: ${savedMedia.filePath}`);

      return savedMedia;
    } catch (error) {
      media.status = MediaStatus.FAILED;
      await this.mediaRepository.save(media);
      throw new InternalServerErrorException(
        `Error al completar upload: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`);
    }
    return media;
  }

  async findByUserId(userId: string): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { uploadedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteMedia(id: string, userId: string, token?: string): Promise<void> {
    const media = await this.findMediaByIdAndUser(id, userId);

    try {
      // Eliminar comentarios relacionados primero
      if (token) {
        await this.commentsService.deleteCommentsByMediaId(id, token);
      }

      // Eliminar archivos físicos
      if (media.filePath && fs.existsSync(media.filePath)) {
        await fs.promises.unlink(media.filePath);
      }

      if (media.thumbnailPath && fs.existsSync(media.thumbnailPath)) {
        await fs.promises.unlink(media.thumbnailPath);
      }

      // Limpiar chunks si existen
      await this.cleanupChunks(id);

      // Eliminar registro de la base de datos
      await this.mediaRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar media: ${error.message}`,
      );
    }
  }

  private async findMediaByIdAndUser(id: string, userId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id, uploadedBy: userId },
    });

    if (!media) {
      throw new NotFoundException(
        `Media con ID ${id} no encontrado o no tienes permisos`,
      );
    }

    return media;
  }

  private async countUploadedChunks(mediaId: string): Promise<number> {
    const chunkDir = path.join(this.chunksDir, mediaId);
    
    if (!fs.existsSync(chunkDir)) {
      return 0;
    }

    const files = await fs.promises.readdir(chunkDir);
    return files.filter(file => file.startsWith('chunk_')).length;
  }

  private async assembleFile(media: Media): Promise<string> {
    const chunkDir = path.join(this.chunksDir, media.id);
    const extension = this.getFileExtension(media.mimeType);
    const finalFileName = `${uuidv4()}.${extension}`;
    const finalFilePath = path.join(this.uploadsDir, finalFileName);

    const writeStream = fs.createWriteStream(finalFilePath);

    try {
      for (let i = 0; i < media.totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `chunk_${i}`);
        
        if (!fs.existsSync(chunkPath)) {
          throw new Error(`Chunk ${i} no encontrado`);
        }

        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
      }

      writeStream.end();
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });

      return finalFilePath;
    } catch (error) {
      // Limpiar archivo parcial si hay error
      if (fs.existsSync(finalFilePath)) {
        await fs.promises.unlink(finalFilePath);
      }
      throw error;
    }
  }

  private async cleanupChunks(mediaId: string): Promise<void> {
    const chunkDir = path.join(this.chunksDir, mediaId);
    
    if (fs.existsSync(chunkDir)) {
      await fs.promises.rm(chunkDir, { recursive: true, force: true });
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    }
  }

  private isValidMimeType(mimeType: string, mediaType: MediaType): boolean {
    const validMimeTypes = {
      [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [MediaType.VIDEO]: ['video/mp4', 'video/avi', 'video/mkv', 'video/mov'],
      [MediaType.AUDIO]: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    };

    return validMimeTypes[mediaType]?.includes(mimeType) || false;
  }

  private getFileExtension(mimeType: string): string {
    const extension = mime.extension(mimeType);
    return extension || 'bin';
  }

  // Método para testing: dividir archivo en chunks
  async splitFileForTesting(
    file: Express.Multer.File, 
    numChunks: number
  ): Promise<{
    originalName: string;
    originalSize: number;
    totalChunks: number;
    chunkSize: number;
    chunks: {
      chunkNumber: number;
      size: number;
      data: string;
    }[];
  }> {
    const fileBuffer = file.buffer;
    const totalSize = fileBuffer.length;
    const chunkSize = Math.ceil(totalSize / numChunks);
    
    const chunks = [];
    
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunkBuffer = fileBuffer.slice(start, end);
      
      chunks.push({
        chunkNumber: i,
        size: chunkBuffer.length,
        data: chunkBuffer.toString('base64'),
      });
    }
    
    return {
      originalName: file.originalname,
      originalSize: totalSize,
      totalChunks: numChunks,
      chunkSize: chunkSize,
      chunks: chunks,
    };
  }

  // Métodos para servir archivos
  async getFileStream(id: string, userId: string): Promise<{ stream: fs.ReadStream; media: Media }> {
    const media = await this.findMediaByIdAndUser(id, userId);
    
    if (media.status !== MediaStatus.COMPLETED) {
      throw new BadRequestException(
        `Archivo no disponible. Estado actual: ${media.status}`,
      );
    }

    if (!media.filePath || !fs.existsSync(media.filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    const stream = fs.createReadStream(media.filePath);
    return { stream, media };
  }

  async getFileBuffer(id: string, userId: string): Promise<{ buffer: Buffer; media: Media }> {
    const media = await this.findMediaByIdAndUser(id, userId);
    
    if (media.status !== MediaStatus.COMPLETED) {
      throw new BadRequestException(
        `Archivo no disponible. Estado actual: ${media.status}`,
      );
    }

    if (!media.filePath || !fs.existsSync(media.filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    const buffer = await fs.promises.readFile(media.filePath);
    return { buffer, media };
  }

  async getStorageInfo(): Promise<{
    uploadsDir: string;
    chunksDir: string;
    totalFiles: number;
    diskUsage: {
      uploads: { files: number; sizeBytes: number };
      chunks: { files: number; sizeBytes: number };
    };
  }> {
    const uploadsInfo = await this.getDirectoryInfo(this.uploadsDir);
    const chunksInfo = await this.getDirectoryInfo(this.chunksDir);
    
    const totalFiles = await this.mediaRepository.count({
      where: { status: MediaStatus.COMPLETED }
    });

    return {
      uploadsDir: path.resolve(this.uploadsDir),
      chunksDir: path.resolve(this.chunksDir),
      totalFiles,
      diskUsage: {
        uploads: uploadsInfo,
        chunks: chunksInfo,
      },
    };
  }

  private async getDirectoryInfo(dirPath: string): Promise<{ files: number; sizeBytes: number }> {
    if (!fs.existsSync(dirPath)) {
      return { files: 0, sizeBytes: 0 };
    }

    const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
    let totalFiles = 0;
    let totalSize = 0;

    for (const file of files) {
      if (file.isFile()) {
        totalFiles++;
        const filePath = path.join(dirPath, file.name);
        const stats = await fs.promises.stat(filePath);
        totalSize += stats.size;
      }
    }

    return { files: totalFiles, sizeBytes: totalSize };
  }
} 