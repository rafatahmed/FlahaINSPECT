import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { TusHooksModule } from './tus-hooks/tus-hooks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DbModule, HealthModule, TusHooksModule, AuthModule, UsersModule, ProjectsModule],
})
export class AppModule {}
