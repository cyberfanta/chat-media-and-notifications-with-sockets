import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health Check del servicio de notificaciones' })
  @ApiResponse({ 
    status: 200, 
    description: 'Servicio funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'notifications-service' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      service: 'notifications-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
} 