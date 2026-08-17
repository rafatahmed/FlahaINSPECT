import { Module } from '@nestjs/common';
import { PollerService } from './poller/poller.service';

@Module({
  providers: [PollerService],
})
export class AppModule {}
