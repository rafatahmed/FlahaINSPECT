'use client';
import { CloseSession } from './close-session';
import { useEffect, useState } from 'react';
type Session = {
  id: string;
  ended_at: string | null;
  closure?: {
    id: string;
    actor_id: string;
    closed_at: string;
    reason: string;
  } | null;
  last_contact_at: string | null;
  known_pending: number | null;
  known_failed: number | null;
  sync_state: string;
  removed_count: number;
};
export function SessionStatus({
  projectId,
  canClose = false,
}: {
  projectId: string;
  canClose?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Session[]>([]),
    [error, setError] = useState(''),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setItems([]);
    setError('');
    setLoading(true);
    fetch('/bff/projects/' + projectId + '/inspection-sessions', {
      signal: abort.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        return response.json();
      })
      .then((data) => {
        if (!abort.signal.aborted) {
          setItems(data.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) {
          setError('Session status unavailable. Completeness is unknown.');
          setLoading(false);
        }
      });
    return () => abort.abort();
  }, [projectId, refresh]);
  return (
    <section aria-label="Inspection sessions">
      <h2>Inspection sessions</h2>
      <button onClick={() => setRefresh((v) => v + 1)}>
        Refresh session status
      </button>
      <p>
        Status reflects the last phone contact. Active or disconnected visits
        are not assumed fully synced.
      </p>
      {loading && <p role="status">Loading session status.</p>}
      {!loading && !error && !items.length && (
        <p>No inspection sessions received from a phone yet.</p>
      )}
      {!!error && <p role="status">{error}</p>}
      {items.map((visit) => (
        <div
          className="card"
          key={visit.id}
          style={{ overflowWrap: 'anywhere' }}
        >
          <h3>Session {visit.id}</h3>
          {visit.closure && (
            <p>
              Closure reason: {visit.closure.reason}. Closed by{' '}
              {visit.closure.actor_id} at {visit.closure.closed_at}. Closure
              history is retained after recovery.
            </p>
          )}
          {canClose && !visit.ended_at && !visit.closure && (
            <CloseSession
              id={visit.id}
              onClosed={() => setRefresh((value) => value + 1)}
            />
          )}
          <p>
            {visit.closure
              ? 'Administratively closed'
              : visit.ended_at
                ? 'Ended'
                : 'Active'}{' '}
            — {visit.sync_state}
          </p>
          <p>
            Last contact:{' '}
            {visit.last_contact_at
              ? new Date(visit.last_contact_at).toISOString()
              : 'unknown'}
            . Pending: {visit.known_pending ?? 'unknown'}; failed:{' '}
            {visit.known_failed ?? 'unknown'}; removed: {visit.removed_count}.
          </p>
        </div>
      ))}
    </section>
  );
}
