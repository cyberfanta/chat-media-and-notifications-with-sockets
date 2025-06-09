import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('info')
  @ApiOperation({ summary: 'Obtener información de almacenamiento' })
  @ApiResponse({ status: 200, description: 'Información de almacenamiento' })
  async getStorageInfo() {
    const info = await this.storageService.getStorageInfo();
    return { storage: info };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar salud del almacenamiento' })
  @ApiResponse({ status: 200, description: 'Estado de salud del almacenamiento' })
  async getStorageHealth() {
    const health = await this.storageService.checkStorageHealth();
    return { health };
  }
} 