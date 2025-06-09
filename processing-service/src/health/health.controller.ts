import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  
  @Get()
  @ApiOperation({ summary: 'Health check del servicio de procesamiento' })
  @ApiResponse({ status: 200, description: 'Servicio funcionando correctamente' })
  check() {
    return {
      success: true,
      message: 'Processing Service está funcionando correctamente',
      timestamp: new Date().toISOString(),
      service: 'processing-service',
      version: '1.0.0'
    };
  }
} 