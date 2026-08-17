import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { InspectionPointsModule } from './inspection-points/inspection-points.module';
import { ProjectsModule } from './projects/projects.module';
import { TusHooksModule } from './tus-hooks/tus-hooks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DbModule,
    HealthModule,
    TusHooksModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    InspectionPointsModule,
  ],
})
export class AppModule {}
