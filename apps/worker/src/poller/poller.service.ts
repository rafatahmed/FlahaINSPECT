import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { claimJob, finishJob, reclaimExpiredLeases } from '../jobs/claimer';
import { handleReport } from '../jobs/report.handler';
import { handleThumbnail } from '../jobs/thumbnail.handler';

@Injectable()
export class PollerService implements OnModuleInit, OnModuleDestroy {
  readonly name = 'inspect-worker';
  private readonly log = new Logger(PollerService.name);
  private readonly workerId = `worker-${randomUUID()}`;
  private timer: NodeJS.Timeout | null = null;
  private pool: Pool | null = null;
  private s3: S3Client | null = null;
  private running = false;

  status(): { service: 'worker'; ready: boolean } {
    return { service: 'worker', ready: true };
  }

  onModuleInit(): void {
    if (!process.env.DATABASE_URL) {
      this.log.warn('DATABASE_URL missing — poller idle');
      return;
    }
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
      this.s3 = new S3Client({
        region: process.env.S3_REGION ?? 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      });
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, 2000);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.pool?.end();
  }

  private async tick(): Promise<void> {
    if (this.running || !this.pool) return;
    this.running = true;
    try {
      await reclaimExpiredLeases(this.pool);
      const job = await claimJob(this.pool, this.workerId);
      if (!job) return;
      try {
        if (!this.s3 || !process.env.S3_BUCKET) {
          throw new Error('S3 is not configured');
        }
        if (job.type === 'generate_thumbnail' && job.payload.photo_id) {
          await handleThumbnail(this.pool, this.s3, process.env.S3_BUCKET, job.payload.photo_id);
        } else if (job.type === 'generate_report' && job.payload.report_id) {
          await handleReport(this.pool, this.s3, process.env.S3_BUCKET, job.payload.report_id);
        } else {
          throw new Error(`unhandled job type ${job.type}`);
        }
        await finishJob(this.pool, job.id, true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'job failed';
        this.log.error(message);
        await finishJob(this.pool, job.id, false, message);
      }
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === '42P01') {
        this.log.warn('schema not ready — poller idle until migrate');
      } else {
        this.log.error(err instanceof Error ? err.message : 'tick failed');
      }
    } finally {
      this.running = false;
    }
  }
}
