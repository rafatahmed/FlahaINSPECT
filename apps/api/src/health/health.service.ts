import { Injectable } from '@nestjs/common';
import net from 'node:net';
import { StorageService } from '../storage/storage.service';

export type ReadyChecks = {
  db: boolean;
  storage: boolean;
};

@Injectable()
export class HealthService {
  constructor(private readonly storage: StorageService) {}

  async checkReady(): Promise<ReadyChecks> {
    const [db, storage] = await Promise.all([
      this.pingDatabase(),
      this.storage.bucketReady(),
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
