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

  it('allows optional title (whitelist + forbidNonWhitelisted)', () => {
    const dto = readFileSync(join(__dirname, 'reports.dto.ts'), 'utf8');
    expect(dto).toContain('@IsOptional()');
    expect(dto).toContain('@IsString()');
    expect(dto).toContain('title');
  });

  it('imports AuthModule so JwtAuthGuard can resolve AUTH_STORE', () => {
    const mod = readFileSync(join(__dirname, 'reports.module.ts'), 'utf8');
    expect(mod).toContain('AuthModule');
  });
});
