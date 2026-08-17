import { Injectable } from '@nestjs/common';
import net from 'node:net';

export type ReadyChecks = {
  db: boolean;
  storage: boolean;
};

@Injectable()
export class HealthService {
  async checkReady(): Promise<ReadyChecks> {
    const [db, storage] = await Promise.all([
      this.pingDatabase(),
      this.pingStorage(),
    ]);
    return { db, storage };
  }

  private async pingDatabase(): Promise<boolean> {
    const raw = process.env.DATABASE_URL;
    if (!raw) return false;
    try {
      const parsed = new URL(raw);
      const port = Number(parsed.port || 5432);
      return tcpOk(parsed.hostname, port);
    } catch {
      return false;
    }
  }

  private async pingStorage(): Promise<boolean> {
    const endpoint = process.env.S3_ENDPOINT;
    if (!endpoint) return false;
    try {
      const url = new URL('/minio/health/live', endpoint);
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

function tcpOk(host: string, port: number, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}
