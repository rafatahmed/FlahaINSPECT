import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_PREFIX } from '@flaha/inspect-api-client';
import { ACCESS_COOKIE, API_BASE, REFRESH_COOKIE } from '@/lib/session';

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await fetch(`${API_BASE}${API_PREFIX}/auth/logout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  return new NextResponse(null, { status: 204 });
}
