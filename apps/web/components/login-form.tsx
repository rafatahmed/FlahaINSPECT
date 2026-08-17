'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/dashboard';
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch('/bff/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      }),
    });
    const json = (await res.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;
    setBusy(false);
    if (!res.ok) {
      const code = json?.error?.code;
      setError(code === 'ACCOUNT_LOCKED' ? 'Try again in 15 minutes' : 'Email or password is incorrect.');
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form className="login" onSubmit={(e) => void onSubmit(e)}>
      <h1>FlahaINSPECT</h1>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required disabled={busy} />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required disabled={busy} />
      <button type="submit" disabled={busy}>
        {busy ? '…' : 'Log in'}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
