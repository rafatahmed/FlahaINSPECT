import {
  DEFAULT_ARCHIVE_RETENTION_MONTHS,
  decideGcDeletes,
  isPastArchiveRetention,
  retentionFromEnv,
  shouldEnqueueGc,
} from './gc-policy';

const policy = { incompleteHours: 48, archiveMonths: 12 };

describe('orphan GC policy (G-05 default 12 months)', () => {
  it('keeps G-05 at 12 months unless env overrides', () => {
    expect(DEFAULT_ARCHIVE_RETENTION_MONTHS).toBe(12);
    expect(retentionFromEnv({}).archiveMonths).toBe(12);
    expect(retentionFromEnv({ RETENTION_ARCHIVE_MONTHS: '18' }).archiveMonths).toBe(18);
  });

  it('keeps referenced objects and young orphans', () => {
    const now = new Date('2026-08-17T12:00:00Z');
    const deleted = decideGcDeletes(
      [
        { key: 'photos/a.jpg', lastModified: new Date('2026-01-01T00:00:00Z') },
        { key: 'uploads/fresh', lastModified: new Date('2026-08-17T10:00:00Z') },
        { key: 'uploads/stale', lastModified: new Date('2026-08-10T00:00:00Z') },
      ],
      {
        referencedKeys: new Set(['photos/a.jpg']),
        expiredArchiveKeys: new Set(),
      },
      now,
      policy,
    );
    expect(deleted).toEqual(['uploads/stale']);
  });

  it('deletes archived-project objects after 12 months even if referenced', () => {
    const now = new Date('2026-08-17T00:00:00Z');
    expect(isPastArchiveRetention(new Date('2025-07-01T00:00:00Z'), now, 12)).toBe(true);
    expect(isPastArchiveRetention(new Date('2026-07-01T00:00:00Z'), now, 12)).toBe(false);
    const deleted = decideGcDeletes(
      [{ key: 'photos/old.jpg', lastModified: new Date('2024-01-01T00:00:00Z') }],
      {
        referencedKeys: new Set(['photos/old.jpg']),
        expiredArchiveKeys: new Set(['photos/old.jpg']),
      },
      now,
      policy,
    );
    expect(deleted).toEqual(['photos/old.jpg']);
  });

  it('enqueues daily when idle and never doubles an in-flight job', () => {
    const now = new Date('2026-08-17T00:00:00Z');
    expect(shouldEnqueueGc({ hasActive: true, lastSucceededAt: null, now })).toBe(false);
    expect(shouldEnqueueGc({ hasActive: false, lastSucceededAt: null, now })).toBe(true);
    expect(
      shouldEnqueueGc({
        hasActive: false,
        lastSucceededAt: new Date('2026-08-16T12:00:00Z'),
        now,
      }),
    ).toBe(false);
    expect(
      shouldEnqueueGc({
        hasActive: false,
        lastSucceededAt: new Date('2026-08-15T23:00:00Z'),
        now,
      }),
    ).toBe(true);
  });
});
