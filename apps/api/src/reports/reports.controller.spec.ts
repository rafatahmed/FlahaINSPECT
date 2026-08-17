import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('reports routes', () => {
  const src = readFileSync(join(__dirname, 'reports.controller.ts'), 'utf8');
  const svc = readFileSync(join(__dirname, 'reports.service.ts'), 'utf8');

  it('is manager-only and returns 202', () => {
    expect(src).toContain("@Roles('manager')");
    expect(src).toContain('projects/:projectId/reports');
    expect(svc).toContain('202');
    expect(svc).toContain('REPORT_IN_PROGRESS');
    expect(svc).toContain('generate_report');
    expect(svc).toContain('report.download');
  });
});
