import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import {
  KEYSET_DEFAULT_LIMIT,
  KEYSET_MAX_LIMIT,
  ZERO_UUID,
  keysetAfter,
  parseDeltaQuery,
  splitDeltaPage,
} from './keyset';

describe('parseDeltaQuery', () => {
  it('defaults to epoch + zero UUID and limit 100 (initial sync)', () => {
    expect(parseDeltaQuery({})).toEqual({
      sinceUpdatedAt: new Date(0),
      sinceId: ZERO_UUID,
      limit: KEYSET_DEFAULT_LIMIT,
    });
  });

  it('rejects a lone cursor half', () => {
    expect(() => parseDeltaQuery({ since_updated_at: '2026-01-01T00:00:00.000Z' })).toThrow(ApiException);
    try {
      parseDeltaQuery({ since_id: ZERO_UUID });
    } catch (err) {
      expect((err as ApiException).code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });

  it('clamps limit to 200', () => {
    expect(parseDeltaQuery({ limit: '999' }).limit).toBe(KEYSET_MAX_LIMIT);
  });

  it('accepts a paired cursor', () => {
    const parsed = parseDeltaQuery({
      since_updated_at: '2026-01-01T00:00:00.000Z',
      since_id: ZERO_UUID,
      limit: '25',
    });
    expect(parsed.sinceId).toBe(ZERO_UUID);
    expect(parsed.sinceUpdatedAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(parsed.limit).toBe(25);
  });
});

describe('splitDeltaPage (KD-38)', () => {
  const t = (iso: string) => new Date(iso);

  it('puts live rows in items and tombstones in deleted_ids only', () => {
    const page = splitDeltaPage(
      [
        { id: 'a', updatedAt: t('2026-01-01T00:00:00.000Z'), deletedAt: null, name: 'live' },
        { id: 'b', updatedAt: t('2026-01-01T00:00:01.000Z'), deletedAt: t('2026-01-01T00:00:01.000Z') },
        { id: 'c', updatedAt: t('2026-01-01T00:00:02.000Z'), deletedAt: null, name: 'also' },
      ],
      10,
    );
    expect(page.items.map((r) => r.id)).toEqual(['a', 'c']);
    expect(page.deleted_ids).toEqual(['b']);
    expect(page.has_more).toBe(false);
    expect(page.next_cursor).toEqual({
      since_updated_at: '2026-01-01T00:00:02.000Z',
      since_id: 'c',
    });
    expect(page).not.toHaveProperty('photos');
  });

  it('uses the last row of the page for next_cursor even when that row is deleted', () => {
    const page = splitDeltaPage(
      [
        { id: 'a', updatedAt: t('2026-01-01T00:00:00.000Z'), deletedAt: null },
        { id: 'b', updatedAt: t('2026-01-01T00:00:01.000Z'), deletedAt: t('2026-01-01T00:00:01.000Z') },
        { id: 'extra', updatedAt: t('2026-01-01T00:00:02.000Z'), deletedAt: null },
      ],
      2,
    );
    expect(page.has_more).toBe(true);
    expect(page.items.map((r) => r.id)).toEqual(['a']);
    expect(page.deleted_ids).toEqual(['b']);
    expect(page.next_cursor).toEqual({
      since_updated_at: '2026-01-01T00:00:01.000Z',
      since_id: 'b',
    });
  });

  it('returns an empty page with a null cursor', () => {
    expect(splitDeltaPage([], 100)).toEqual({
      items: [],
      deleted_ids: [],
      next_cursor: null,
      has_more: false,
    });
  });
});

describe('keysetAfter', () => {
  it('compares the exclusive (updated_at, id) tuple (KD-26)', () => {
    expect(keysetAfter.toString()).toContain('timestamptz');
    expect(keysetAfter.toString()).toContain('>');
    expect(
      keysetAfter('updated_at', 'id', new Date('2026-01-01T00:00:00.000Z'), ZERO_UUID),
    ).toBeTruthy();
  });
});
