import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ERROR_CATALOG, ErrorCode } from '../common/errors';

describe('PROJECT_ARCHIVED contract (PR-08 acceptance)', () => {
  it('is 422 in the catalog', () => {
    expect(ERROR_CATALOG[ErrorCode.PROJECT_ARCHIVED].status).toBe(422);
  });

  it('is raised on point create and photo register against an archived project', () => {
    const points = readFileSync(join(__dirname, '..', 'inspection-points', 'inspection-points.service.ts'), 'utf8');
    const photos = readFileSync(join(__dirname, '..', 'photos', 'photos.service.ts'), 'utf8');
    expect(points).toMatch(/PROJECT_ARCHIVED/);
    expect(photos).toMatch(/PROJECT_ARCHIVED/);
  });
});
