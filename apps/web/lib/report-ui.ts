export type ReportStatus = 'queued' | 'processing' | 'ready' | 'failed';

export type ReportRow = {
  id: string;
  project_id: string;
  status: ReportStatus;
  title?: string | null;
  point_count?: number | null;
  generated_at?: string | null;
  error_message?: string | null;
  created_at?: string;
};

export function isTerminal(status: ReportStatus): boolean {
  return status === 'ready' || status === 'failed';
}

export function parseGenerateResponse(
  status: number,
  json: unknown,
): { kind: 'ok'; report: ReportRow } | { kind: 'in_progress'; reportId: string } | { kind: 'too_many' } | { kind: 'error'; message: string } {
  const body = json as {
    report?: ReportRow;
    error?: { code?: string; details?: { report_id?: string }; message?: string };
  } | null;
  if (status === 202 && body?.report) {
    return { kind: 'ok', report: body.report };
  }
  if (status === 409 && body?.error?.code === 'REPORT_IN_PROGRESS') {
    const id = body.error.details?.report_id;
    if (id) return { kind: 'in_progress', reportId: id };
  }
  if (status === 400 && body?.error?.code === 'VALIDATION_ERROR') {
    return { kind: 'too_many' };
  }
  return { kind: 'error', message: body?.error?.message ?? 'Could not start report' };
}

export function stripDownloadUrl(report: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...report };
  delete rest.download_url;
  delete rest.expires_in;
  return rest;
}

/** KD-41: browser must not receive long-lived signed MinIO URLs. */
export function stripSignedMedia(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSignedMedia);
  if (!value || typeof value !== 'object') return value;
  const rest = { ...(value as Record<string, unknown>) };
  delete rest.url;
  delete rest.thumbnail_url;
  delete rest.url_expires_in;
  delete rest.thumbnail_url_expires_in;
  delete rest.download_url;
  delete rest.expires_in;
  if (rest.photos) rest.photos = stripSignedMedia(rest.photos);
  if (rest.items) rest.items = stripSignedMedia(rest.items);
  if (rest.point) rest.point = stripSignedMedia(rest.point);
  return rest;
}
