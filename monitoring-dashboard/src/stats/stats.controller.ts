import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DashboardService } from '../dashboard/dashboard.service';

@ApiTags('stats')
@Controller('api/stats')
export class StatsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Estadísticas generales del sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas del sistema de procesamiento',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            totalJobs: { type: 'number', description: 'Total de trabajos procesados' },
            activeJobs: { type: 'number', description: 'Trabajos activos en cola' },
            completedJobs: { type: 'number', description: 'Trabajos completados' },
            failedJobs: { type: 'number', description: 'Trabajos fallidos' },
            avgProcessingTime: { type: 'number', description: 'Tiempo promedio de procesamiento (ms)' },
            systemUptime: { type: 'number', description: 'Tiempo de actividad del sistema (ms)' },
          }
        }
      }
    }
  })
  async getSystemStats() {
    const stats = await this.dashboardService.getSystemStats();
    return { stats };
  }
} 