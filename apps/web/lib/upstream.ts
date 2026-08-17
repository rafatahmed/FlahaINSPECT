import { cookies } from 'next/headers';
import { API_PREFIX } from '@flaha/inspect-api-client';
import { ACCESS_COOKIE, API_BASE, REFRESH_COOKIE, cookieBase } from './session';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function refreshAccess(jar: CookieStore): Promise<string | null> {
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  jar.set(ACCESS_COOKIE, json.access_token, { ...cookieBase, maxAge: json.expires_in });
  jar.set(REFRESH_COOKIE, json.refresh_token, { ...cookieBase, maxAge: 7 * 24 * 3600 });
  return json.access_token;
}

export async function upstream(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: unknown }> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  const send = (access?: string) =>
    fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(access ? { authorization: `Bearer ${access}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let res = await send(token ?? undefined);
  if (res.status === 401) {
    const next = await refreshAccess(jar);
    if (next) res = await send(next);
  }
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, json };
}
