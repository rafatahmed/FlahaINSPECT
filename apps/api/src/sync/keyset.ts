import { sql, type SQL } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';

export const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
export const KEYSET_DEFAULT_LIMIT = 100;
export const KEYSET_MAX_LIMIT = 200;

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export type DeltaQuery = {
  sinceUpdatedAt: Date;
  sinceId: string;
  limit: number;
};

export type KeysetRow = {
  id: string;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type DeltaSplit<T extends KeysetRow> = {
  items: T[];
  deleted_ids: string[];
  next_cursor: { since_updated_at: string; since_id: string } | null;
  has_more: boolean;
};

export function parseDeltaQuery(input: {
  since_updated_at?: string;
  since_id?: string;
  limit?: string;
}): DeltaQuery {
  const hasSince = Boolean(input.since_updated_at);
  const hasId = Boolean(input.since_id);
  if (hasSince !== hasId) {
    throw new ApiException(
      ErrorCode.VALIDATION_ERROR,
      undefined,
      'since_updated_at and since_id must be supplied together',
    );
  }

  let sinceUpdatedAt = new Date(0);
  if (hasSince) {
    sinceUpdatedAt = new Date(input.since_updated_at as string);
    if (Number.isNaN(sinceUpdatedAt.getTime())) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'since_updated_at must be ISO-8601');
    }
  }

  const sinceId = hasId ? (input.since_id as string) : ZERO_UUID;
  if (!UUID_RE.test(sinceId)) {
    throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'since_id must be a UUID');
  }

  let limit = KEYSET_DEFAULT_LIMIT;
  if (input.limit !== undefined && input.limit !== '') {
    const n = Number(input.limit);
    if (!Number.isFinite(n) || n < 1) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'limit must be a positive integer');
    }
    limit = Math.min(KEYSET_MAX_LIMIT, Math.floor(n));
  }

  return { sinceUpdatedAt, sinceId, limit };
}

/** Fetch limit+1, then split: live → items, tombstones → deleted_ids (KD-38). */
export function splitDeltaPage<T extends KeysetRow>(rows: T[], limit: number): DeltaSplit<T> {
  const has_more = rows.length > limit;
  const page = has_more ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  return {
    items: page.filter((row) => row.deletedAt == null),
    deleted_ids: page.filter((row) => row.deletedAt != null).map((row) => row.id),
    next_cursor: last
      ? { since_updated_at: last.updatedAt.toISOString(), since_id: last.id }
      : null,
    has_more,
  };
}

export function keysetAfter(updatedAt: unknown, id: unknown, sinceUpdatedAt: Date, sinceId: string): SQL {
  return sql`(${updatedAt}, ${id}) > (${sinceUpdatedAt.toISOString()}::timestamptz, ${sinceId}::uuid)`;
}
