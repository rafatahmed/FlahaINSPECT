import { renderIssuedReport } from './issued-report.handler';
import { renderPdf } from './pdf-renderer';
import type { Pool } from 'pg';
import type { S3Client } from '@aws-sdk/client-s3';

jest.mock('./pdf-renderer', () => ({
  renderPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')),
}));

describe('issued report snapshots', () => {
  const report = {
    id: 'report-id',
    project_id: 'project-id',
    client_revision: 1,
    status: 'processing',
    filters_json: {
      project: 'Test project',
      issued_at: '2026-11-04T00:00:00Z',
      findings: [
        {
          id: 'finding-id',
          category: 'defect',
          summary: '<script>approved</script>',
          image: 'data:image/png;base64,AA==',
        },
      ],
    },
  };

  it('renders only the frozen approved data and publishes without overwriting a ready revision', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const send = jest.fn().mockResolvedValue({});
    await renderIssuedReport(
      { query } as unknown as Pool,
      { send } as unknown as S3Client,
      'private',
      report,
    );
    const html = (renderPdf as jest.Mock).mock.calls.at(-1)[0];
    expect(html).toContain('&lt;script&gt;approved&lt;/script&gt;');
    expect(html).toContain('data:image/png;base64,AA==');
    expect(html).not.toContain('<script>');
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain(
      "status IN ('queued','processing')",
    );
    expect(send.mock.calls[0][0].input.Key).toMatch(
      /^reports\/project-id\/report-id-.+\.pdf$/,
    );
  });

  it('never renders or writes an already ready revision again', async () => {
    const query = jest.fn();
    const send = jest.fn();
    await renderIssuedReport(
      { query } as unknown as Pool,
      { send } as unknown as S3Client,
      'private',
      { ...report, status: 'ready' },
    );
    expect(query).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
