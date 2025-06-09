import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CleanupService } from './cleanup.service';

@ApiTags('cleanup')
@Controller('cleanup')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('run')
  @ApiOperation({ summary: 'Ejecutar limpieza manual' })
  @ApiResponse({ status: 200, description: 'Limpieza ejecutada correctamente' })
  async runCleanup() {
    await this.cleanupService.runScheduledCleanup();
    return { message: 'Cleanup tasks executed successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Obtener logs de limpieza' })
  @ApiResponse({ status: 200, description: 'Lista de logs de limpieza' })
  async getCleanupLogs() {
    const logs = await this.cleanupService.getCleanupLogs();
    return { logs };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de limpieza' })
  @ApiResponse({ status: 200, description: 'Estadísticas de limpieza' })
  async getCleanupStats() {
    const stats = await this.cleanupService.getCleanupStats();
    return { stats };
  }
} 