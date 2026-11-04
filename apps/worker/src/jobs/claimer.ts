import { Pool } from 'pg';

export const LEASE_MINUTES = 15;

export type ClaimedJob = {
  id: string;
  type: string;
  payload: { photo_id?: string; report_id?: string };
  attempts: number;
  max_attempts: number;
};

export async function claimJob(pool: Pool, workerId: string): Promise<ClaimedJob | null> {
  const result = await pool.query<ClaimedJob>(
    `
    UPDATE jobs
    SET status = 'running',
        locked_at = now(),
        locked_by = $1,
        attempts = attempts + 1,
        updated_at = now()
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'pending' AND run_after <= now()
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, type, payload, attempts, max_attempts
    `,
    [workerId],
  );
  const job = result.rows[0] ?? null;
  if (job?.type === 'generate_report' && job.payload.report_id) {
    await pool.query(
      `UPDATE reports SET status = 'processing', updated_at = now()
       WHERE id = $1 AND status = 'queued'`,
      [job.payload.report_id],
    );
  }
  return job;
}

/** KD-32 / KD-39: 15m lease. Dead job must fail the coupled report. */
export async function reclaimExpiredLeases(pool: Pool): Promise<number> {
  const dead = await pool.query<{ count: number }>(
    `WITH dead AS (
       UPDATE jobs
       SET status = 'dead',
           last_error = COALESCE(last_error, 'lease expired'),
           locked_at = NULL,
           locked_by = NULL,
           updated_at = now()
       WHERE status = 'running'
         AND locked_at < now() - interval '15 minutes'
         AND attempts >= max_attempts
       RETURNING type, payload
     ), failed_reports AS (
       UPDATE reports SET status = 'failed', error_message = 'lease expired', updated_at = now()
       FROM dead
       WHERE dead.type = 'generate_report'
         AND reports.id = (dead.payload->>'report_id')::uuid
         AND reports.status IN ('queued', 'processing')
     )
     SELECT count(*)::int AS count FROM dead`,
  );

  const pending = await pool.query(
    `
    UPDATE jobs
    SET status = 'pending',
        locked_at = NULL,
        locked_by = NULL,
        updated_at = now()
    WHERE status = 'running'
      AND locked_at < now() - interval '15 minutes'
      AND attempts < max_attempts
    `,
  );
  return (dead.rows[0]?.count ?? 0) + (pending.rowCount ?? 0);
}

export async function finishJob(pool: Pool, id: string, ok: boolean, error?: string): Promise<void> {
  if (ok) {
    await pool.query(`UPDATE jobs SET status = 'succeeded', last_error = NULL, updated_at = now() WHERE id = $1`, [
      id,
    ]);
    return;
  }
  await pool.query(
    `WITH updated AS (
       UPDATE jobs
       SET status = (CASE WHEN attempts >= max_attempts THEN 'dead' ELSE 'pending' END)::job_status,
           run_after = now() + interval '30 seconds',
           last_error = $2,
           locked_at = NULL,
           locked_by = NULL,
           updated_at = now()
       WHERE id = $1
       RETURNING status, type, payload
     )
     UPDATE reports SET status = 'failed', error_message = $2, updated_at = now()
     FROM updated
     WHERE updated.status = 'dead' AND updated.type = 'generate_report'
       AND reports.id = (updated.payload->>'report_id')::uuid
       AND reports.status IN ('queued', 'processing')`,
    [id, error ?? 'failed'],
  );
}
