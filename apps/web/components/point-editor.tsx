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
};

export function PointEditor({ point }: { point: Point }) {
  const router = useRouter();
  const photo = point.photos?.[0];
  const ready = photo?.status === 'ready';
  const [remarks, setRemarks] = useState(point.remarks ?? '');
  const [procedure, setProcedure] = useState(point.recommended_procedure ?? '');
  const [status, setStatus] = useState(point.status === 'acknowledged' ? 'open' : point.status);
  const [version, setVersion] = useState(point.version);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    await fetch(`/bff/inspection-points/${point.id}`, { method: 'DELETE' });
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
        <label>Field note</label>
        <textarea readOnly value={point.note ?? ''} rows={4} />
        <label>Remarks</label>
        <textarea maxLength={4000} value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
        <label>Recommended procedure</label>
        <textarea maxLength={4000} value={procedure} onChange={(e) => setProcedure(e.target.value)} rows={4} />
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  );
}
