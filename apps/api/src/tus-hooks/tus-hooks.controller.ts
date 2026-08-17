import { Body, Controller, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import { recordTus } from '../metrics/registry';
import { PhotosService, type TusHookBody } from '../photos/photos.service';

@Controller('internal/tus')
export class TusHooksController {
  constructor(private readonly photos: PhotosService) {}

  @Post()
  handleRoot(
    @Headers('hook-name') hookName: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('upload-length') uploadLength: string | undefined,
    @Headers('x-tusd-hook-secret') headerSecret: string | undefined,
    @Query('secret') querySecret: string | undefined,
    @Body() body: TusHookBody,
  ) {
    this.assertSecret(headerSecret, querySecret);
    return this.dispatch(hookName ?? body.Type, authorization, uploadLength, body);
  }

  @Post(':event')
  handleEvent(
    @Param('event') event: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('upload-length') uploadLength: string | undefined,
    @Headers('x-tusd-hook-secret') headerSecret: string | undefined,
    @Query('secret') querySecret: string | undefined,
    @Body() body: TusHookBody,
  ) {
    this.assertSecret(headerSecret, querySecret);
    return this.dispatch(event, authorization, uploadLength, body);
  }

  private dispatch(
    event: string | undefined,
    authorization: string | undefined,
    uploadLength: string | undefined,
    body: TusHookBody,
  ) {
    const name = (event ?? '').toLowerCase();
    if (name === 'pre-create' || name === 'post-create') {
      return this.withTusMetric('pre_create', () =>
        this.photos.preCreate({ authorization, 'upload-length': uploadLength }, body),
      );
    }
    if (name === 'post-finish') {
      return this.withTusMetric('post_finish', () => this.photos.postFinish(body));
    }
    return { ok: true, event: name || 'unknown' };
  }

  private async withTusMetric<T>(
    hook: 'pre_create' | 'post_finish',
    fn: () => T | Promise<T>,
  ): Promise<T> {
    try {
      const result = await fn();
      recordTus(hook, 'ok');
      return result;
    } catch (err) {
      recordTus(hook, 'error');
      throw err;
    }
  }

  private assertSecret(
    headerSecret: string | undefined,
    querySecret: string | undefined,
  ): void {
    const expected = process.env.TUSD_HOOK_SECRET;
    const provided = headerSecret ?? querySecret;
    if (!expected || !provided || provided !== expected) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
  }
}
