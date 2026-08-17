import { buildReportHtml, escapeHtml } from './html';

describe('report HTML (KD-40)', () => {
  it('escapes user text', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
    expect(escapeHtml(`a&b"c'`)).toBe('a&amp;b&quot;c&#39;');
  });

  it('does not leave raw tags in the template', () => {
    const html = buildReportHtml({
      projectName: '<Farm>',
      generatedBy: 'Mgr',
      generatedAt: '2026-01-01T00:00:00Z',
      counts: { defect: 1, normal: 0, note: 0, openDefects: 1 },
      points: [
        {
          captured_at: '2026-01-01T00:00:00Z',
          latitude: 25.3,
          longitude: 51.5,
          accuracy_m: 4,
          category: 'defect',
          status: 'open',
          note: '<img src=x onerror=alert(1)>',
          remarks: null,
          recommended_procedure: null,
          inspector_name: 'Ali',
          thumb_data_uri: null,
        },
      ],
    });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('Image unavailable');
    expect(html).toContain('&lt;Farm&gt;');
  });
});
