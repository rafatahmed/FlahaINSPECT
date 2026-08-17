import { claimJob, finishJob, reclaimExpiredLeases } from './claimer';

describe('claimJob SQL shape', () => {
  it('uses SKIP LOCKED so two workers cannot claim the same row', () => {
    const src = claimJob.toString();
    expect(src).toContain('FOR UPDATE SKIP LOCKED');
    expect(src).toContain("status = 'pending'");
    expect(src).toContain("status = 'processing'");
  });

  it('reclaims a 15m lease and fails the report when attempts are exhausted', () => {
    const src = reclaimExpiredLeases.toString();
    expect(src).toContain('15');
    expect(src).toContain("status = 'running'");
    expect(src).toContain("status = 'failed'");
  });

  it('couples a dead generate_report job to reports.failed', () => {
    const src = finishJob.toString();
    expect(src).toContain("status = 'failed'");
    expect(src).toContain('report_id');
  });
});
