import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DashboardService } from '../dashboard/dashboard.service';

@ApiTags('queue')
@Controller('api/queue')
export class QueueController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado actual de la cola de procesamiento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado detallado de la cola de procesamiento',
    schema: {
      type: 'object',
      properties: {
        queue: {
          type: 'object',
          properties: {
            waiting: { type: 'number', description: 'Trabajos en espera' },
            active: { type: 'number', description: 'Trabajos en proceso' },
            completed: { type: 'number', description: 'Trabajos completados' },
            failed: { type: 'number', description: 'Trabajos fallidos' },
            paused: { type: 'boolean', description: 'Si la cola está pausada' },
            processing: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  progress: { type: 'number', minimum: 0, maximum: 100 },
                  startedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getQueueStatus() {
    const queue = await this.dashboardService.getQueueStatus();
    return { queue };
  }
} 