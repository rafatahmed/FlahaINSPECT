import { API_PREFIX } from '@flaha/inspect-api-client';
import type { SessionResponse } from '@flaha/inspect-api-client';

export const ACCESS_COOKIE = 'flaha_access';
export const REFRESH_COOKIE = 'flaha_refresh';
export const API_BASE = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600;
export const PATHNAME_HEADER = 'x-flaha-pathname';

export const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

type CookieWriter = {
  set: (name: string, value: string, opts: typeof cookieBase & { maxAge: number }) => unknown;
};

export function applySessionCookies(jar: CookieWriter, tokens: TokenPair): void {
  jar.set(ACCESS_COOKIE, tokens.access_token, { ...cookieBase, maxAge: tokens.expires_in });
  jar.set(REFRESH_COOKIE, tokens.refresh_token, { ...cookieBase, maxAge: REFRESH_COOKIE_MAX_AGE });
}

export function clearSessionCookies(jar: CookieWriter): void {
  jar.set(ACCESS_COOKIE, '', { ...cookieBase, maxAge: 0 });
  jar.set(REFRESH_COOKIE, '', { ...cookieBase, maxAge: 0 });
}

export { safeNextPath } from './workspace';

export async function exchangeRefresh(refreshToken: string): Promise<TokenPair | null> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as TokenPair | null;
  if (!json?.access_token || !json?.refresh_token || typeof json.expires_in !== 'number') {
    return null;
  }
  return json;
}

/** Tokens stay in HttpOnly cookies — never in the JSON the browser sees (KD-18). */
export function publicSession(session: SessionResponse): { user: SessionResponse['user'] } {
  return { user: session.user };
}

export function hasTokenLeak(body: unknown): boolean {
  const text = JSON.stringify(body ?? {});
  return text.includes('access_token') || text.includes('refresh_token');
}
