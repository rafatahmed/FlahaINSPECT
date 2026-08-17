/** G-05 default until Ops names a different number. 30-day months. */
export const DEFAULT_ARCHIVE_RETENTION_MONTHS = 12;
export const DEFAULT_INCOMPLETE_HOURS = 48;
export const GC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type ListedObject = { key: string; lastModified: Date };

export type GcPolicy = {
  incompleteHours: number;
  archiveMonths: number;
};

export type GcRefs = {
  referencedKeys: Set<string>;
  expiredArchiveKeys: Set<string>;
};

export function retentionFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): GcPolicy {
  const months = Number(env.RETENTION_ARCHIVE_MONTHS ?? DEFAULT_ARCHIVE_RETENTION_MONTHS);
  const hours = Number(env.TUSD_INCOMPLETE_HOURS ?? DEFAULT_INCOMPLETE_HOURS);
  return {
    archiveMonths: Number.isFinite(months) && months > 0 ? months : DEFAULT_ARCHIVE_RETENTION_MONTHS,
    incompleteHours: Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_INCOMPLETE_HOURS,
  };
}

export function isPastArchiveRetention(archivedAt: Date, now: Date, months: number): boolean {
  const ms = months * 30 * 24 * 60 * 60 * 1000;
  return now.getTime() - archivedAt.getTime() >= ms;
}

export function shouldEnqueueGc(input: {
  hasActive: boolean;
  lastSucceededAt: Date | null;
  now: Date;
  intervalMs?: number;
}): boolean {
  if (input.hasActive) return false;
  if (!input.lastSucceededAt) return true;
  return input.now.getTime() - input.lastSucceededAt.getTime() >= (input.intervalMs ?? GC_INTERVAL_MS);
}

export function decideGcDeletes(
  objects: ListedObject[],
  refs: GcRefs,
  now: Date,
  policy: GcPolicy,
): string[] {
  const incompleteMs = policy.incompleteHours * 60 * 60 * 1000;
  const out: string[] = [];
  for (const obj of objects) {
    if (refs.expiredArchiveKeys.has(obj.key)) {
      out.push(obj.key);
      continue;
    }
    if (refs.referencedKeys.has(obj.key)) continue;
    if (now.getTime() - obj.lastModified.getTime() >= incompleteMs) {
      out.push(obj.key);
    }
  }
  return out;
}

export async function runGc(input: {
  objects: ListedObject[];
  refs: GcRefs;
  now: Date;
  policy: GcPolicy;
  deleteObject: (key: string) => Promise<void>;
}): Promise<{ deleted: string[] }> {
  const keys = decideGcDeletes(input.objects, input.refs, input.now, input.policy);
  for (const key of keys) {
    await input.deleteObject(key);
  }
  return { deleted: keys };
}
