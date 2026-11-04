import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IssuedReportsController } from './issued-reports.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [AuthModule],
  controllers: [ReportsController, IssuedReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
