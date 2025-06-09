import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  async getStorageInfo() {
    // Simulación básica - en implementación real aquí iría la lógica real
    return {
      totalSpaceGB: 100,
      usedSpaceGB: 25,
      availableSpaceGB: 75,
      usagePercentage: 25,
      status: 'healthy',
      warning: false,
      critical: false,
    };
  }

  async checkStorageHealth() {
    const info = await this.getStorageInfo();
    const warningThreshold = this.configService.get('STORAGE_WARNING_THRESHOLD', 90);
    const criticalThreshold = this.configService.get('STORAGE_CRITICAL_THRESHOLD', 95);

    const warning = info.usagePercentage >= warningThreshold;
    const critical = info.usagePercentage >= criticalThreshold;

    return {
      ...info,
      warning,
      critical,
      status: critical ? 'critical' : warning ? 'warning' : 'healthy',
    };
  }
} 