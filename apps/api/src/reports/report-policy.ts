export const REPORT_POINT_CAP = 200;

export function assertReportPointCap(count: number): void {
  if (count > REPORT_POINT_CAP) {
    throw new Error('REPORT_POINT_CAP');
  }
}

export function canEnqueueReport(activeId: string | null): 'ok' | 'in_progress' {
  return activeId ? 'in_progress' : 'ok';
}

export function canGenerateReport(role: string): boolean {
  return role === 'manager';
}
