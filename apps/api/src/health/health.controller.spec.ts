import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('returns ok for the API process', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: { checkReady: jest.fn() },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    expect(controller.getHealth()).toEqual({ status: 'ok', service: 'api' });
  });

  it('returns ready when db and storage respond', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkReady: jest.fn().mockResolvedValue({ db: true, storage: true }),
          },
        },
      ],
    }).compile();

    await expect(moduleRef.get(HealthController).getReady()).resolves.toEqual({
      status: 'ready',
      db: true,
      storage: true,
    });
  });

  it('is 503 when dependencies are down', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkReady: jest
              .fn()
              .mockResolvedValue({ db: false, storage: false }),
          },
        },
      ],
    }).compile();

    await expect(moduleRef.get(HealthController).getReady()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
