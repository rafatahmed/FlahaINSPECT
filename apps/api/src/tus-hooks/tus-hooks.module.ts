import { Module } from '@nestjs/common';
import { TusHooksController } from './tus-hooks.controller';

@Module({
  controllers: [TusHooksController],
})
export class TusHooksModule {}
