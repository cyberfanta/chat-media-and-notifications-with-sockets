import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica el estado del servicio',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
  })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
} 