import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TusHooksController } from './tus-hooks.controller';

describe('TusHooksController', () => {
  const previous = process.env.TUSD_HOOK_SECRET;

  beforeEach(() => {
    process.env.TUSD_HOOK_SECRET = 'test-hook-secret';
  });

  afterAll(() => {
    process.env.TUSD_HOOK_SECRET = previous;
  });

  async function controller(): Promise<TusHooksController> {
    const moduleRef = await Test.createTestingModule({
      controllers: [TusHooksController],
    }).compile();
    return moduleRef.get(TusHooksController);
  }

  it('rejects missing secrets', async () => {
    const hooks = await controller();
    expect(() => hooks.handleEvent('pre-create', undefined, undefined)).toThrow(
      UnauthorizedException,
    );
  });

  it('accepts the shared secret via query (compose hook URL)', async () => {
    const hooks = await controller();
    expect(hooks.handleEvent('pre-create', undefined, 'test-hook-secret')).toEqual({
      ok: true,
      event: 'pre-create',
    });
  });

  it('accepts the shared secret via header', async () => {
    const hooks = await controller();
    expect(
      hooks.handleRoot('post-finish', 'test-hook-secret', undefined),
    ).toEqual({ ok: true, event: 'post-finish' });
  });
});
