import {
  Controller,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * tusd HTTP hooks. Full AuthZ / hash / parent-point logic is PR-07.
 * PR-02 only: require the shared hook secret and acknowledge the event.
 */
@Controller('internal/tus')
export class TusHooksController {
  @Post()
  handleRoot(
    @Headers('hook-name') hookName: string | undefined,
    @Headers('x-tusd-hook-secret') headerSecret: string | undefined,
    @Query('secret') querySecret: string | undefined,
  ): { ok: true; event: string } {
    this.assertSecret(headerSecret, querySecret);
    return { ok: true, event: hookName ?? 'unknown' };
  }

  @Post(':event')
  handleEvent(
    @Param('event') event: string,
    @Headers('x-tusd-hook-secret') headerSecret: string | undefined,
    @Query('secret') querySecret: string | undefined,
  ): { ok: true; event: string } {
    this.assertSecret(headerSecret, querySecret);
    return { ok: true, event };
  }

  private assertSecret(
    headerSecret: string | undefined,
    querySecret: string | undefined,
  ): void {
    const expected = process.env.TUSD_HOOK_SECRET;
    const provided = headerSecret ?? querySecret;
    if (!expected || !provided || provided !== expected) {
      throw new UnauthorizedException({ error: { code: 'UNAUTHORIZED' } });
    }
  }
}
