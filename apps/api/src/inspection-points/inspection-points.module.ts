import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InspectionPointsController } from './inspection-points.controller';
import { InspectionPointsService } from './inspection-points.service';

@Module({
  imports: [AuthModule],
  controllers: [InspectionPointsController],
  providers: [InspectionPointsService],
})
export class InspectionPointsModule {}
