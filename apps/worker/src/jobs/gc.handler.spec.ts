import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('gc handler wiring', () => {
  it('lists the four storage prefixes and enqueues gc_orphan_object', () => {
    const src = readFileSync(join(__dirname, 'gc.handler.ts'), 'utf8');
    expect(src).toContain("uploads/");
    expect(src).toContain("photos/");
    expect(src).toContain("thumbs/");
    expect(src).toContain("reports/");
    expect(src).toContain("gc_orphan_object");
    expect(src).toContain('retentionFromEnv');
  });
});
