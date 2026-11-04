import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { InspectionSessionsController } from './inspection-sessions.controller';
import { InspectionSessionsService } from './inspection-sessions.service';
@Module({
  imports: [AuthModule, DbModule],
  controllers: [InspectionSessionsController],
  providers: [InspectionSessionsService],
})
export class InspectionSessionsModule {}
