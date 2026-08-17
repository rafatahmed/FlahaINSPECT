import { assertReportPointCap, canEnqueueReport, canGenerateReport, REPORT_POINT_CAP } from './report-policy';

describe('report policy (KD-39 / 200 cap)', () => {
  it('caps at 200 points', () => {
    expect(REPORT_POINT_CAP).toBe(200);
    expect(() => assertReportPointCap(200)).not.toThrow();
    expect(() => assertReportPointCap(201)).toThrow('REPORT_POINT_CAP');
  });

  it('blocks a second active report (KD-39)', () => {
    expect(canEnqueueReport(null)).toBe('ok');
    expect(canEnqueueReport('already-queued')).toBe('in_progress');
  });

  it('is manager-only to generate', () => {
    expect(canGenerateReport('manager')).toBe(true);
    expect(canGenerateReport('inspector')).toBe(false);
    expect(canGenerateReport('client')).toBe(false);
  });
});
