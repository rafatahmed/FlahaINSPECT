import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TusHooksModule } from './tus-hooks/tus-hooks.module';

@Module({
  imports: [HealthModule, TusHooksModule],
})
export class AppModule {}
