import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Pool } from 'pg';
import {
  decideGcDeletes,
  isPastArchiveRetention,
  retentionFromEnv,
  shouldEnqueueGc,
  type GcRefs,
  type ListedObject,
} from './gc-policy';

const PREFIXES = ['uploads/', 'photos/', 'thumbs/', 'reports/'];

export async function handleGc(pool: Pool, s3: S3Client, bucket: string): Promise<{ deleted: number }> {
  const policy = retentionFromEnv();
  const refs = await loadRefs(pool, policy.archiveMonths);
  const objects = await listAll(s3, bucket);
  const keys = decideGcDeletes(objects, refs, new Date(), policy);
  for (const key of keys) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
  return { deleted: keys.length };
}

export async function maybeEnqueueGc(pool: Pool): Promise<boolean> {
  const active = await pool.query(
    `SELECT 1 FROM jobs WHERE type = 'gc_orphan_object' AND status IN ('pending', 'running') LIMIT 1`,
  );
  const last = await pool.query<{ updated_at: Date }>(
    `SELECT updated_at FROM jobs
     WHERE type = 'gc_orphan_object' AND status = 'succeeded'
     ORDER BY updated_at DESC LIMIT 1`,
  );
  if (
    !shouldEnqueueGc({
      hasActive: (active.rowCount ?? 0) > 0,
      lastSucceededAt: last.rows[0]?.updated_at ?? null,
      now: new Date(),
    })
  ) {
    return false;
  }
  await pool.query(`INSERT INTO jobs (type, payload) VALUES ('gc_orphan_object', '{}'::jsonb)`);
  return true;
}

async function loadRefs(pool: Pool, archiveMonths: number): Promise<GcRefs> {
  const referencedKeys = new Set<string>();
  const expiredArchiveKeys = new Set<string>();
  const photos = await pool.query<{
    storage_key: string | null;
    thumbnail_key: string | null;
    is_archived: boolean;
    archived_at: Date;
  }>(
    `SELECT p.storage_key, p.thumbnail_key, pr.is_archived, pr.updated_at AS archived_at
     FROM photos p
     JOIN projects pr ON pr.id = p.project_id`,
  );
  const now = new Date();
  for (const row of photos.rows) {
    for (const key of [row.storage_key, row.thumbnail_key]) {
      if (!key) continue;
      referencedKeys.add(key);
      if (row.is_archived && isPastArchiveRetention(row.archived_at, now, archiveMonths)) {
        expiredArchiveKeys.add(key);
      }
    }
  }
  const reports = await pool.query<{ storage_key: string | null }>(
    `SELECT storage_key FROM reports WHERE storage_key IS NOT NULL`,
  );
  for (const row of reports.rows) {
    if (row.storage_key) referencedKeys.add(row.storage_key);
  }
  return { referencedKeys, expiredArchiveKeys };
}

async function listAll(s3: S3Client, bucket: string): Promise<ListedObject[]> {
  const out: ListedObject[] = [];
  for (const prefix of PREFIXES) {
    let token: string | undefined;
    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: token,
        }),
      );
      for (const obj of page.Contents ?? []) {
        if (obj.Key && obj.LastModified) {
          out.push({ key: obj.Key, lastModified: obj.LastModified });
        }
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }
  return out;
}
