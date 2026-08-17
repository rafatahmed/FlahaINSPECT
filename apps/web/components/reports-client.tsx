'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCapturedAt } from '@/lib/datetime';
import {
  isTerminal,
  parseGenerateResponse,
  type ReportRow,
} from '@/lib/report-ui';

type Project = { id: string; name: string; is_archived?: boolean };

export function ReportsClient({
  projects,
  initialProjectId,
}: {
  projects: Project[];
  initialProjectId?: string;
}) {
  const [projectId, setProjectId] = useState(initialProjectId ?? projects[0]?.id ?? '');
  const [items, setItems] = useState<ReportRow[]>([]);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async (id: string) => {
    const res = await fetch(`/bff/projects/${id}/reports`);
    const json = (await res.json().catch(() => null)) as { items?: ReportRow[] } | null;
    setItems(json?.items ?? []);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    void refreshList(projectId);
  }, [projectId, refreshList]);

  useEffect(() => {
    if (!watchId) return;
    let stop = false;
    const tick = async () => {
      const res = await fetch(`/bff/reports/${watchId}`);
      const json = (await res.json().catch(() => null)) as { report?: ReportRow } | null;
      const report = json?.report;
      if (!report || stop) return;
      setItems((prev) => {
        const next = prev.filter((r) => r.id !== report.id);
        return [report, ...next];
      });
      if (isTerminal(report.status)) {
        setWatchId(null);
        if (report.status === 'failed') {
          setError(report.error_message ?? 'Report failed');
        }
      }
    };
    void tick();
    const t = setInterval(() => void tick(), 2000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [watchId]);

  async function generate() {
    if (!projectId || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await fetch(`/bff/projects/${projectId}/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const json = await res.json().catch(() => null);
    const parsed = parseGenerateResponse(res.status, json);
    setBusy(false);
    if (parsed.kind === 'ok') {
      setWatchId(parsed.report.id);
      setNotice('Generating… this page will update when the PDF is ready.');
      setItems((prev) => [parsed.report, ...prev.filter((r) => r.id !== parsed.report.id)]);
      return;
    }
    if (parsed.kind === 'in_progress') {
      setWatchId(parsed.reportId);
      setNotice('A report is already queued or processing for this project.');
      return;
    }
    if (parsed.kind === 'too_many') {
      setError('This project has more than 200 points. Narrow the set before generating.');
      return;
    }
    setError(parsed.message);
  }

  return (
    <>
      <div className="header">
        <label>
          Project{' '}
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={busy || !projectId} onClick={() => void generate()}>
          {busy ? '…' : 'Generate PDF'}
        </button>
      </div>
      {notice ? <p className="muted">{notice}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Status</th>
            <th>Points</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{formatCapturedAt(r.created_at ?? r.generated_at)}</td>
              <td>{r.status}</td>
              <td>{r.point_count ?? '—'}</td>
              <td>
                {r.status === 'ready' ? (
                  <a href={`/bff/reports/${r.id}/file`}>Download</a>
                ) : r.status === 'failed' ? (
                  <span className="error">{r.error_message ?? 'failed'}</span>
                ) : (
                  <span className="muted">working…</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 ? <p className="muted">No reports yet.</p> : null}
    </>
  );
}
