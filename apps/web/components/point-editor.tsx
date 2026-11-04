'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { categoryLabel, STATUS_OPTIONS } from '@/lib/category';
import { formatCapturedAt } from '@/lib/datetime';

type Photo = { id: string; status: string };
type Point = {
  id: string;
  category: string;
  captured_at: string;
  inspector_id: string;
  accuracy_m: number | null;
  latitude: number;
  longitude: number;
  outside_boundary: boolean;
  note: string | null;
  remarks: string | null;
  recommended_procedure: string | null;
  status: string;
  version: number;
  photos?: Photo[];
  release?: { summary: string } | null;
};

export function PointEditor({ point, canEdit }: { point: Point; canEdit: boolean }) {
  const router = useRouter();
  const photo = point.photos?.[0];
  const ready = photo?.status === 'ready';
  const [remarks, setRemarks] = useState(point.remarks ?? '');
  const [procedure, setProcedure] = useState(point.recommended_procedure ?? '');
  const [status, setStatus] = useState(point.status === 'acknowledged' ? 'open' : point.status);
  const [version, setVersion] = useState(point.version);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [released, setReleased] = useState(!!point.release);
  const [summary, setSummary] = useState(point.release?.summary ?? '');

  async function release() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/bff/inspection-points/${point.id}/release`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ version, summary: summary.trim() }),
      });
      if (response.ok) setReleased(true);
      else setError(response.status === 409 ? 'Refresh the observation before releasing it.' : 'Could not release the finding.');
    } catch {
      setError('Could not confirm release. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/bff/inspection-points/${point.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        version,
        remarks,
        recommended_procedure: procedure,
        status,
      }),
    });
    const json = (await res.json().catch(() => null)) as {
      error?: { code?: string; details?: { current_version?: number } };
      point?: Point;
    } | null;
    setBusy(false);
    if (res.status === 409) {
      setError('Version conflict. Reload the page to get the server values, then save again.');
      return;
    }
    if (!res.ok) {
      setError(json?.error?.code ?? 'Save failed');
      return;
    }
    if (json?.point) setVersion(json.point.version);
    router.refresh();
  }

  async function remove() {
    if (!confirm('Soft-delete this point? It will leave the default map and list.')) return;
    const res = await fetch(`/bff/inspection-points/${point.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete this point.');
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="editor">
      <section>
        {ready && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="media" src={`/bff/photos/${photo.id}/thumb`} alt="" />
        ) : (
          <div className="photo-ph">Photo still uploading</div>
        )}
        <p className="muted">
          {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
        </p>
      </section>
      <section>
        <p>
          <strong>{categoryLabel(point.category)}</strong>
        </p>
        <p className="muted">Captured {formatCapturedAt(point.captured_at)}</p>
        <p className="muted">Inspector {point.inspector_id}</p>
        <p className="muted">Accuracy {point.accuracy_m ?? '—'} m</p>
        <p className="muted">Outside boundary: {point.outside_boundary ? 'yes' : 'no'}</p>
        <label htmlFor="field-note">Field note</label>
        <textarea id="field-note" readOnly value={point.note ?? ''} rows={4} />
        {canEdit ? <>
          <label htmlFor="remarks">Remarks</label>
          <textarea id="remarks" maxLength={4000} value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
          <label htmlFor="procedure">Recommended procedure</label>
          <textarea id="procedure" maxLength={4000} value={procedure} onChange={(e) => setProcedure(e.target.value)} rows={4} />
          <label htmlFor="point-status">Status</label>
          <select id="point-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="button" disabled={busy} onClick={() => void save()}>
            Save
          </button>
          <button type="button" onClick={() => void remove()}>
            Soft-delete
          </button>
          <section>
            <h2>Client finding</h2>
            {released ? <>
              <p role="status">Finding released to project clients.</p>
              <p>{summary}</p>
            </> : <>
              <label htmlFor="client-summary">Client summary</label>
              <textarea id="client-summary" maxLength={4000} value={summary} onChange={e => setSummary(e.target.value)} />
              <button type="button" disabled={busy || !ready || !summary.trim()} onClick={() => void release()}>
                Release finding
              </button>
              {!ready && <p>A ready photo is required to release a finding.</p>}
            </>}
          </section>
          {error ? <p className="error">{error}</p> : null}
        </> : <dl>
          <dt>Remarks</dt><dd>{point.remarks || 'None'}</dd>
          <dt>Recommended procedure</dt><dd>{point.recommended_procedure || 'None'}</dd>
          <dt>Status</dt><dd>{point.status}</dd>
        </dl>}
      </section>
    </div>
  );
}
