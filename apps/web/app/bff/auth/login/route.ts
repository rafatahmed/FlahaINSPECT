import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_PREFIX } from '@flaha/inspect-api-client';
import type { SessionResponse } from '@flaha/inspect-api-client';
import { ACCESS_COOKIE, API_BASE, REFRESH_COOKIE, cookieBase, publicSession } from '@/lib/session';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as SessionResponse | { error?: unknown } | null;
  if (!res.ok || !json || !('access_token' in json)) {
    return NextResponse.json(json ?? { error: { code: 'UNAUTHORIZED', message: 'Login failed' } }, {
      status: res.status,
    });
  }
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, json.access_token, { ...cookieBase, maxAge: json.expires_in });
  jar.set(REFRESH_COOKIE, json.refresh_token, { ...cookieBase, maxAge: 7 * 24 * 3600 });
  return NextResponse.json(publicSession(json));
}
