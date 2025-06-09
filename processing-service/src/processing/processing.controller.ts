import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ProcessingService } from './processing.service';

@ApiTags('processing')
@Controller('processing')
export class ProcessingController {
  private readonly logger = new Logger(ProcessingController.name);

  constructor(private readonly processingService: ProcessingService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar procesamiento de media' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mediaId: { type: 'number', description: 'ID del archivo de media' },
        uploaderId: { type: 'number', description: 'ID del usuario que subió el archivo' }
      },
      required: ['mediaId', 'uploaderId']
    }
  })
  @ApiResponse({ status: 201, description: 'Procesamiento iniciado' })
  async startProcessing(@Body() body: { mediaId: number; uploaderId: number }) {
    this.logger.log(`Iniciando procesamiento: media=${body.mediaId}, uploader=${body.uploaderId}`);
    
    const job = await this.processingService.startProcessing(body.mediaId, body.uploaderId);
    return {
      success: true,
      message: 'Procesamiento iniciado',
      jobId: job.id,
      data: job
    };
  }

  @Get('job/:id')
  @ApiOperation({ summary: 'Obtener estado de un job de procesamiento' })
  @ApiResponse({ status: 200, description: 'Estado del job' })
  async getJobStatus(@Param('id') id: string) {
    const job = await this.processingService.getJobStatus(id);
    return {
      success: true,
      data: job
    };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Obtener todos los jobs de procesamiento' })
  @ApiResponse({ status: 200, description: 'Lista de jobs' })
  async getAllJobs() {
    const jobs = await this.processingService.getAllJobs();
    return {
      success: true,
      data: jobs,
      total: jobs.length
    };
  }

  @Get('media/:id')
  @ApiOperation({ summary: 'Obtener información de media procesado' })
  @ApiResponse({ status: 200, description: 'Información del media procesado' })
  async getProcessedMedia(@Param('id') id: string) {
    const processedMedia = await this.processingService.getProcessedMedia(id);
    return {
      success: true,
      data: processedMedia
    };
  }


} 