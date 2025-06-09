import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ProcessingService } from '../processing/processing.service';
import { JobStatus } from '../entities/processing-job.entity';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly processingService: ProcessingService) {}

    @Get('status')
  @ApiOperation({ summary: 'Obtener estado de la cola de procesamiento' })
  @ApiResponse({ status: 200, description: 'Estado de la cola de procesamiento' })
  async getQueueStatus() {
    // Simulación temporal hasta que se configuren las tablas
    return {
      success: true,
      data: {
        total: 0,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        recentJobs: [],
        message: 'Queue service is ready - database tables pending setup'
      }
    };
  }
} 