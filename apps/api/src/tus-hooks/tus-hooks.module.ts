import { Module } from '@nestjs/common';
import { PhotosModule } from '../photos/photos.module';
import { TusHooksController } from './tus-hooks.controller';

@Module({
  imports: [PhotosModule],
  controllers: [TusHooksController],
})
export class TusHooksModule {}
