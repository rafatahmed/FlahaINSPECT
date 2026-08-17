import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { TusHooksModule } from './tus-hooks/tus-hooks.module';

@Module({
  imports: [DbModule, HealthModule, TusHooksModule, AuthModule],
})
export class AppModule {}
