import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { StorageService } from './storage.service';

describe('storage readiness', () => {
  const originalEnv = process.env;
  afterEach(() => { process.env = originalEnv; });

  it.each([200, 403, 404])('checks the signed bucket HEAD when storage returns %i', async status => {
    const requests: Array<{ method?: string; path?: string; auth?: string }> = [];
    const server = createServer((req, res) => {
      requests.push({ method: req.method, path: req.url, auth: req.headers.authorization });
      res.writeHead(status).end();
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      process.env = { ...originalEnv, S3_ENDPOINT: `http://127.0.0.1:${port}`,
        S3_ACCESS_KEY: 'test-key', S3_SECRET_KEY: 'test-secret', S3_BUCKET: 'pilot-bucket',
        S3_REGION: 'us-east-1', S3_FORCE_PATH_STYLE: 'true' };
      await expect(new StorageService().bucketReady()).resolves.toBe(status === 200);
      expect(requests).toEqual([{
        method: 'HEAD', path: expect.stringMatching(/^\/pilot-bucket\/?(?:\?.*)?$/),
        auth: expect.stringContaining('Credential=test-key/'),
      }]);
    } finally {
      server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  it('reports unavailable for missing bucket configuration', async () => {
    process.env = { ...originalEnv, S3_BUCKET: '' };
    await expect(new StorageService().bucketReady()).resolves.toBe(false);
  });
});
