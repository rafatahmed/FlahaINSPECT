import { Test } from '@nestjs/testing';
import { ApiException } from '../common/api-exception';
import { PhotosService } from '../photos/photos.service';
import { TusHooksController } from './tus-hooks.controller';

describe('TusHooksController', () => {
  const previous = process.env.TUSD_HOOK_SECRET;

  beforeEach(() => {
    process.env.TUSD_HOOK_SECRET = 'test-hook-secret';
  });

  afterAll(() => {
    process.env.TUSD_HOOK_SECRET = previous;
  });

  async function controller(photos?: Partial<PhotosService>): Promise<TusHooksController> {
    const moduleRef = await Test.createTestingModule({
      controllers: [TusHooksController],
      providers: [
        {
          provide: PhotosService,
          useValue: {
            preCreate: jest.fn().mockResolvedValue({ ok: true }),
            postFinish: jest.fn().mockResolvedValue({ ok: true }),
            ...photos,
          },
        },
      ],
    }).compile();
    return moduleRef.get(TusHooksController);
  }

  it('rejects missing secrets', async () => {
    const hooks = await controller();
    expect(() =>
      hooks.handleEvent('pre-create', undefined, undefined, undefined, undefined, {}),
    ).toThrow(ApiException);
  });

  it('accepts the shared secret via query (compose hook URL)', async () => {
    const hooks = await controller();
    expect(
      hooks.handleEvent('unknown', undefined, undefined, undefined, 'test-hook-secret', {}),
    ).toEqual({ ok: true, event: 'unknown' });
  });

  it('accepts the shared secret via header', async () => {
    const hooks = await controller();
    expect(
      hooks.handleRoot('unknown', undefined, undefined, 'test-hook-secret', undefined, {}),
    ).toEqual({ ok: true, event: 'unknown' });
  });

  it('dispatches pre-create and post-create to token validation, not finalize', async () => {
    const preCreate = jest.fn().mockResolvedValue({ ok: true });
    const postFinish = jest.fn().mockResolvedValue({ ok: true });
    const hooks = await controller({ preCreate, postFinish } as Partial<PhotosService>);
    await hooks.handleEvent(
      'pre-create',
      'Bearer tok',
      '100',
      'test-hook-secret',
      undefined,
      { Type: 'pre-create' },
    );
    await hooks.handleEvent(
      'post-create',
      'Bearer tok',
      '100',
      'test-hook-secret',
      undefined,
      { Type: 'post-create' },
    );
    expect(preCreate).toHaveBeenCalledTimes(2);
    expect(postFinish).not.toHaveBeenCalled();
  });

  it('dispatches post-finish to finalize', async () => {
    const postFinish = jest.fn().mockResolvedValue({ ok: true, idempotent: true });
    const hooks = await controller({ postFinish } as Partial<PhotosService>);
    await expect(
      hooks.handleEvent('post-finish', undefined, undefined, 'test-hook-secret', undefined, {
        Type: 'post-finish',
      }),
    ).resolves.toEqual({ ok: true, idempotent: true });
    expect(postFinish).toHaveBeenCalled();
  });
});
