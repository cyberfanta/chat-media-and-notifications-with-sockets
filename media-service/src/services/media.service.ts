import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
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
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');
  private readonly chunksDir = path.join(process.cwd(), 'chunks');

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private commentsService: CommentsService,
    private redisService: RedisService,
  ) {
    this.ensureDirectoriesExist();
  }

  /** Crear directorios necesarios para uploads y chunks */
  private ensureDirectoriesExist() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.chunksDir)) {
      fs.mkdirSync(this.chunksDir, { recursive: true });
    }
  }

  /** Validar tipo MIME del archivo */
  private validateMimeType(mimeType: string, type: MediaType): boolean {
    const allowedMimeTypes = {
      [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [MediaType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
      [MediaType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
    };

    return allowedMimeTypes[type]?.includes(mimeType) || false;
  }

  /** Inicializar proceso de upload multipart */
  async initUpload(userId: string, initUploadDto: InitUploadDto): Promise<Media> {
    if (!this.validateMimeType(initUploadDto.mimeType, initUploadDto.type)) {
      throw new BadRequestException(`Tipo MIME ${initUploadDto.mimeType} no permitido para tipo ${initUploadDto.type}`);
    }

    const media = this.mediaRepository.create({
      id: uuidv4(),
      uploadedBy: userId,
      originalName: initUploadDto.originalName,
      mimeType: initUploadDto.mimeType,
      type: initUploadDto.type,
      totalSize: initUploadDto.totalSize,
      totalChunks: initUploadDto.totalChunks,
      uploadedChunks: 0,
      status: MediaStatus.INITIALIZING,
    });

    const chunkDir = path.join(this.chunksDir, media.id);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const savedMedia = await this.mediaRepository.save(media);
    await this.mediaRepository.update(savedMedia.id, { status: MediaStatus.UPLOADING });

    return savedMedia;
  }

  /** Subir un chunk específico del archivo */
  async uploadChunk(mediaId: string, userId: string, file: Express.Multer.File, chunkNumber: number): Promise<{ success: boolean, uploadedChunks: number, totalChunks: number }> {
    const media = await this.mediaRepository.findOne({ 
      where: { id: mediaId, uploadedBy: userId } 
    });

    if (!media) {
      throw new NotFoundException('Media no encontrado');
    }

    if (media.status !== MediaStatus.UPLOADING && media.status !== MediaStatus.INITIALIZING) {
      throw new BadRequestException('El archivo no está en estado de subida');
    }

    const chunkDir = path.join(this.chunksDir, mediaId);
    const chunkPath = path.join(chunkDir, `chunk_${chunkNumber}`);

    if (fs.existsSync(chunkPath)) {
      throw new BadRequestException(`El chunk ${chunkNumber} ya existe`);
    }

    fs.writeFileSync(chunkPath, file.buffer);

    const updatedMedia = await this.mediaRepository.update(mediaId, { 
      uploadedChunks: media.uploadedChunks + 1 
    });

    const currentMedia = await this.mediaRepository.findOne({ where: { id: mediaId } });

    return {
      success: true,
      uploadedChunks: currentMedia.uploadedChunks,
      totalChunks: currentMedia.totalChunks
    };
  }

  /** Ensamblar chunks y completar el upload */
  async completeUpload(mediaId: string, userId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ 
      where: { id: mediaId, uploadedBy: userId } 
    });

    if (!media) {
      throw new NotFoundException('Media no encontrado');
    }

    if (media.uploadedChunks !== media.totalChunks) {
      throw new BadRequestException(`Faltan chunks: ${media.uploadedChunks}/${media.totalChunks}`);
    }

    try {
      if (media.status !== MediaStatus.PROCESSING) {
        await this.mediaRepository.update(mediaId, { status: MediaStatus.PROCESSING });
      }

      const finalFilePath = path.join(this.uploadsDir, `${mediaId}${path.extname(media.originalName)}`);

      if (!fs.existsSync(finalFilePath)) {
        await this.assembleFile(mediaId, finalFilePath, media.totalChunks);
      }

      const fileStats = fs.statSync(finalFilePath);
      
      await this.mediaRepository.update(mediaId, {
        filePath: finalFilePath,
        totalSize: fileStats.size,
        status: MediaStatus.COMPLETED,
      });

      await this.cleanupChunks(mediaId);

      await this.redisService.publishNotificationEvent('media_uploaded', {
        mediaId: media.id,
        userId: media.uploadedBy,
        filename: media.originalName,
        success: true
      });

      return await this.mediaRepository.findOne({ where: { id: mediaId } });
    } catch (error) {
      await this.mediaRepository.update(mediaId, { status: MediaStatus.FAILED });
      throw new BadRequestException(`Error al completar upload: ${error.message}`);
    }
  }

  /** Ensamblar archivo a partir de los chunks */
  private async assembleFile(mediaId: string, outputPath: string, totalChunks: number): Promise<void> {
    const writeStream = fs.createWriteStream(outputPath);
    
    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(this.chunksDir, mediaId, `chunk_${i}`);
        
        if (!fs.existsSync(chunkPath)) {
          throw new Error(`Chunk ${i} no encontrado`);
        }

        const chunkData = fs.readFileSync(chunkPath);
        writeStream.write(chunkData);
      }
      
      writeStream.end();
      
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });
    } catch (error) {
      writeStream.destroy();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      throw error;
    }
  }

  /** Limpiar chunks temporales después del ensamblado */
  private async cleanupChunks(mediaId: string): Promise<void> {
    const chunkDir = path.join(this.chunksDir, mediaId);
    
    if (fs.existsSync(chunkDir)) {
      const files = fs.readdirSync(chunkDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(chunkDir, file));
      });
      fs.rmdirSync(chunkDir);
    }
  }

  /** Eliminar media completo incluyendo archivos físicos */
  async remove(id: string, userId: string): Promise<void> {
    const media = await this.findOne(id, userId);

    try {
      await this.redisService.publishNotificationEvent('media_delete_comments', {
        mediaId: id,
        userId: userId
      });

      if (media.filePath && fs.existsSync(media.filePath)) {
        fs.unlinkSync(media.filePath);
      }

      await this.cleanupChunks(id);

      await this.mediaRepository.remove(media);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar media: ${error.message}`);
    }
  }

  /** Obtener un media específico del usuario */
  async findOne(id: string, userId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id, uploadedBy: userId },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`);
    }

    return media;
  }

  /** Obtener todos los medias del usuario */
  async findAll(userId: string): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { uploadedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Obtener archivo para descarga/visualización */
  async getFile(id: string, userId: string): Promise<{ filePath: string; mimeType: string; originalName: string }> {
    const media = await this.findOne(id, userId);

    if (media.status !== MediaStatus.COMPLETED) {
      throw new BadRequestException('El archivo no está disponible para descarga');
    }

    if (!media.filePath || !fs.existsSync(media.filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    return {
      filePath: media.filePath,
      mimeType: media.mimeType,
      originalName: media.originalName,
    };
  }

  /** Obtener información de almacenamiento */
  async getStorageInfo(): Promise<any> {
    const uploadsExists = fs.existsSync(this.uploadsDir);
    const chunksExists = fs.existsSync(this.chunksDir);

    let uploadStats = { files: 0, sizeBytes: 0 };
    let chunkStats = { files: 0, sizeBytes: 0 };

    if (uploadsExists) {
      const uploadFiles = fs.readdirSync(this.uploadsDir);
      uploadStats.files = uploadFiles.length;
      uploadStats.sizeBytes = uploadFiles.reduce((total, file) => {
        const filePath = path.join(this.uploadsDir, file);
        return total + fs.statSync(filePath).size;
      }, 0);
    }

    if (chunksExists) {
      const chunkDirs = fs.readdirSync(this.chunksDir);
      chunkStats = chunkDirs.reduce((stats, dir) => {
        const dirPath = path.join(this.chunksDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath);
          stats.files += files.length;
          stats.sizeBytes += files.reduce((total, file) => {
            return total + fs.statSync(path.join(dirPath, file)).size;
          }, 0);
        }
        return stats;
      }, { files: 0, sizeBytes: 0 });
    }

    const totalFiles = await this.mediaRepository.count();

    return {
      uploadsDir: this.uploadsDir,
      chunksDir: this.chunksDir,
      totalFiles,
      diskUsage: {
        uploads: uploadStats,
        chunks: chunkStats,
      },
    };
  }

  /** Dividir archivo en chunks para testing */
  async splitFileForTesting(file: Express.Multer.File, chunks: number): Promise<{ chunks: string[], metadata: any }> {
    const chunkSize = Math.ceil(file.buffer.length / chunks);
    const splitChunks: string[] = [];

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.buffer.length);
      const chunkBuffer = file.buffer.slice(start, end);
      const base64Chunk = chunkBuffer.toString('base64');
      splitChunks.push(base64Chunk);
    }

    return {
      chunks: splitChunks,
      metadata: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        totalSize: file.buffer.length,
        totalChunks: chunks,
        chunkSize,
      },
    };
  }

  // Métodos para servir archivos
  async getFileStream(id: string, userId: string): Promise<{ stream: fs.ReadStream; media: Media }> {
    const media = await this.findOne(id, userId);
    
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
    const media = await this.findOne(id, userId);
    
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
} 