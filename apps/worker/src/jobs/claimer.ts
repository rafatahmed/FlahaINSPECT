import { Pool } from 'pg';

export type ClaimedJob = {
  id: string;
  type: string;
  payload: { photo_id?: string };
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
  return result.rows[0] ?? null;
}

export async function finishJob(pool: Pool, id: string, ok: boolean, error?: string): Promise<void> {
  if (ok) {
    await pool.query(`UPDATE jobs SET status = 'succeeded', last_error = NULL, updated_at = now() WHERE id = $1`, [
      id,
    ]);
    return;
  }
  await pool.query(
    `
    UPDATE jobs
    SET status = CASE WHEN attempts >= max_attempts THEN 'dead' ELSE 'pending' END,
        run_after = now() + interval '30 seconds',
        last_error = $2,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = now()
    WHERE id = $1
    `,
    [id, error ?? 'failed'],
  );
}
