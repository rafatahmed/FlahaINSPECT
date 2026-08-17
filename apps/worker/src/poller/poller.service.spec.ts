import { Test } from '@nestjs/testing';
import { PollerService } from './poller.service';

describe('PollerService', () => {
  it('reports ready in the scaffold', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PollerService],
    }).compile();

    const poller = moduleRef.get(PollerService);
    expect(poller.status()).toEqual({ service: 'worker', ready: true });
  });
});
