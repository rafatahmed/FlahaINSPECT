import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClientProjectsController } from './client-projects.controller';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController, ClientProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
