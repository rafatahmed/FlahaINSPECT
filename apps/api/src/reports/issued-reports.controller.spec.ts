import { Readable } from 'node:stream';
import { IssuedReportsController } from './issued-reports.controller';
import type { Db } from '../db/client';
import type { StorageService } from '../storage/storage.service';
import type { AuthUser } from '../auth/auth.types';

describe('issued report PDF pause', () => {
  const originalFlag = process.env.PDF_ENABLED;
  const actor: AuthUser = {
    id: 'manager', role: 'manager', email: 'manager@example.test', passwordHash: 'unused',
    fullName: 'Test Manager', locale: 'en', isActive: true, tokenVersion: 1,
  };
  const report = { id: 'report', status: 'queued', revision: 1 };
  afterEach(() => {
    if (originalFlag === undefined) delete process.env.PDF_ENABLED;
    else process.env.PDF_ENABLED = originalFlag;
  });

  function fixture(existing = false) {
    const execute = jest.fn()
      .mockResolvedValueOnce({ rows: [{ name: 'Synthetic project' }] })
      .mockResolvedValueOnce({ rows: existing ? [report] : [] })
      .mockResolvedValueOnce({ rows: [{ name: 'Synthetic project' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'finding', summary: 'Approved', category: 'note', photo_key: 'private/evidence' }] });
    const txExecute = jest.fn()
      .mockResolvedValueOnce({ rows: [{ id: 'project' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [report] })
      .mockResolvedValueOnce({ rows: [] });
    const transaction = jest.fn(async (fn: (tx: { execute: typeof txExecute }) => Promise<unknown>) => fn({ execute: txExecute }));
    const getObject = jest.fn().mockResolvedValue({
      contentType: 'image/png', body: Readable.from([Buffer.from('synthetic evidence')]),
    });
    const controller = new IssuedReportsController(
      { execute, transaction } as unknown as Db,
      { getObject } as unknown as StorageService,
    );
    return { controller, execute, transaction, txExecute, getObject };
  }

  it.each([false, true])('rejects paused issuance before any I/O (existing request: %s)', async existing => {
    process.env.PDF_ENABLED = 'false';
    const f = fixture(existing);
    await expect(f.controller.issue(actor, 'project', { request_id: 'request', summaries: [] }))
      .rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
    expect(f.getObject).not.toHaveBeenCalled();
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.transaction).not.toHaveBeenCalled();
    expect(f.txExecute).not.toHaveBeenCalled();
  });

  it.each(['true', undefined])('issues normally when PDF_ENABLED=%s', async flag => {
    if (flag === undefined) delete process.env.PDF_ENABLED;
    else process.env.PDF_ENABLED = flag;
    const f = fixture();
    await expect(f.controller.issue(actor, 'project', { request_id: 'request', summaries: [] }))
      .resolves.toEqual({ report });
    expect(f.getObject).toHaveBeenCalledWith('private/evidence');
    expect(f.transaction).toHaveBeenCalledTimes(1);
    expect(f.txExecute).toHaveBeenCalledTimes(5);
  });

  it('returns an accepted request on retry after resuming without evidence reads or new writes', async () => {
    process.env.PDF_ENABLED = 'false';
    const f = fixture(true);
    await expect(f.controller.issue(actor, 'project', { request_id: 'request', summaries: [] }))
      .rejects.toMatchObject({ status: 403 });
    process.env.PDF_ENABLED = 'true';
    await expect(f.controller.issue(actor, 'project', { request_id: 'request', summaries: [] }))
      .resolves.toEqual({ report });
    expect(f.getObject).not.toHaveBeenCalled();
    expect(f.transaction).not.toHaveBeenCalled();
  });
});
