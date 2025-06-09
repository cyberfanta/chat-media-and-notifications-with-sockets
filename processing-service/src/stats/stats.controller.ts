import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ProcessingService } from '../processing/processing.service';
import { JobStatus } from '../entities/processing-job.entity';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly processingService: ProcessingService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estadísticas generales de procesamiento' })
  @ApiResponse({ status: 200, description: 'Estadísticas de procesamiento' })
  async getProcessingStats() {
    // Simulación temporal hasta que se configuren las tablas
    return {
      success: true,
      data: {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        successRate: 0,
        avgProcessingTimeMs: 0,
        avgProcessingTimeSeconds: 0,
        timestamp: new Date().toISOString(),
        message: 'Stats service is ready - database tables pending setup'
      }
    };
  }
} 