import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  getHealth(): { status: 'ok'; service: 'api' } {
    return { status: 'ok', service: 'api' };
  }

  @Get('ready')
  async getReady(): Promise<{
    status: 'ready';
    db: boolean;
    storage: boolean;
  }> {
    const checks = await this.health.checkReady();
    if (!checks.db || !checks.storage) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        ...checks,
      });
    }
    return { status: 'ready', ...checks };
  }
}
