import { claimJob } from './claimer';

describe('claimJob SQL shape', () => {
  it('uses SKIP LOCKED so two workers cannot claim the same row', () => {
    const src = claimJob.toString();
    expect(src).toContain('FOR UPDATE SKIP LOCKED');
    expect(src).toContain("status = 'pending'");
  });
});
