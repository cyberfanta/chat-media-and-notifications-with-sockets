import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio funcionando correctamente' })
  getHealth() {
    return {
      status: 'ok',
      service: 'cleanup-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
} 