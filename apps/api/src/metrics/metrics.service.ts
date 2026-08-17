import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { JOB_DEAD_LETTERS, JOB_TOTAL, renderPrometheus, setGauge } from './registry';

@Injectable()
export class MetricsService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool | null) {}

  async scrape(): Promise<string> {
    await this.refreshJobGauges();
    return renderPrometheus();
  }

  private async refreshJobGauges(): Promise<void> {
    if (!this.pool) return;
    try {
      const counts = await this.pool.query<{ type: string; status: string; n: string }>(
        `SELECT type, status, count(*)::text AS n FROM jobs GROUP BY type, status`,
      );
      let dead = 0;
      for (const row of counts.rows) {
        const n = Number(row.n);
        setGauge(JOB_TOTAL, 'Current jobs by type and status', n, {
          type: row.type,
          status: row.status,
        });
        if (row.status === 'dead') dead += n;
      }
      setGauge(JOB_DEAD_LETTERS, 'Jobs in dead status', dead);
    } catch {
      // Schema may not exist yet (compose before migrate).
    }
  }
}
