'use client';
import { useRef, useState } from 'react';
export function CloseSession({
  id,
  onClosed,
}: {
  id: string;
  onClosed: () => void;
}) {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const request = useRef<{ request_id: string; reason: string } | null>(null);
  async function close(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) return;
    if (
      !window.confirm(
        'Close this lost-phone session? This does not confirm that missing evidence was received.',
      )
    )
      return;
    if (!request.current || request.current.reason !== trimmed)
      request.current = { request_id: crypto.randomUUID(), reason: trimmed };
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        '/bff/inspection-sessions/' + id + '/close',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request.current),
        },
      );
      if (!response.ok)
        throw Error(
          'Closure was not confirmed. Refresh session status before retrying; the session may already have ended or access may have changed.',
        );
      onClosed();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Closure unavailable.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={close}>
      <label>
        Closure reason{' '}
        <input
          aria-label="Closure reason"
          required
          maxLength={1000}
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
          style={{ maxWidth: '100%' }}
        />
      </label>
      <button disabled={busy || !reason.trim()}>
        Close lost-phone session
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
