'use client';
import { useState } from 'react';
export function IssueReport({
  projectId,
  findings,
}: {
  projectId: string;
  findings: { id: string; summary: string }[];
}) {
  const [summaries, setSummaries] = useState(
    findings.map(({ id, summary }) => ({ id, summary })),
  );
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [issued, setIssued] = useState(false);
  async function issue() {
    setBusy(true);
    setMessage('');
    const id = requestId ?? crypto.randomUUID();
    setRequestId(id);
    try {
      const r = await fetch(`/bff/projects/${projectId}/issued-reports`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request_id: id, summaries }),
      });
      const result = await r.json();
      if (!r.ok)
        throw new Error(result.error?.message ?? 'Could not issue the report.');
      setIssued(true);
      setMessage(
        `Revision ${result.report.revision} queued. Clients can open it when rendering finishes.`,
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Could not confirm issuance. Retry with the same draft.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      {summaries.map((f, index) => (
        <label key={f.id} style={{ display: 'block' }}>
          Approved summary {index + 1}
          <textarea
            maxLength={4000}
            value={f.summary}
            disabled={busy || issued || !!requestId}
            onChange={(e) =>
              setSummaries((s) =>
                s.map((row) =>
                  row.id === f.id ? { ...row, summary: e.target.value } : row,
                ),
              )
            }
          />
        </label>
      ))}
      {findings.length === 0 ? (
        <p>No released findings to issue.</p>
      ) : (
        <button
          disabled={busy || issued || summaries.some((f) => !f.summary.trim())}
          onClick={() => void issue()}
        >
          {busy ? 'Issuing…' : 'Issue new revision'}
        </button>
      )}
      <p role="status">{message}</p>
      <a href={`/reports?project=${projectId}`}>Report history</a>
    </section>
  );
}
