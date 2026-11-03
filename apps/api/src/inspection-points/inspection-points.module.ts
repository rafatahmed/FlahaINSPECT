import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FindingsController } from './findings.controller';
import { InspectionPointsController } from './inspection-points.controller';
import { InspectionPointsService } from './inspection-points.service';

@Module({
  imports: [AuthModule],
  controllers: [InspectionPointsController, FindingsController],
  providers: [InspectionPointsService],
})
export class InspectionPointsModule {}
