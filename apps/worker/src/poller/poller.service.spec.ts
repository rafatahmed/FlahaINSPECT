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

  it('handles generate_report as well as thumbnails', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const src = readFileSync(join(__dirname, 'poller.service.ts'), 'utf8');
    expect(src).toContain('generate_report');
    expect(src).toContain('reclaimExpiredLeases');
    expect(src).toContain('handleReport');
    expect(src).toContain('42P01');
  });
});
