import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { InspectionPointsModule } from './inspection-points/inspection-points.module';
import { PhotosModule } from './photos/photos.module';
import { ProjectsModule } from './projects/projects.module';
import { StorageModule } from './storage/storage.module';
import { TusHooksModule } from './tus-hooks/tus-hooks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DbModule,
    StorageModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    InspectionPointsModule,
    PhotosModule,
    TusHooksModule,
  ],
})
export class AppModule {}
