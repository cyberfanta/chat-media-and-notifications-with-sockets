import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check del dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard funcionando correctamente' })
  getHealth() {
    return {
      status: 'ok',
      service: 'monitoring-dashboard',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
} 