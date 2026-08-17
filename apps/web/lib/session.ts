import type { SessionResponse } from '@flaha/inspect-api-client';

export const ACCESS_COOKIE = 'flaha_access';
export const REFRESH_COOKIE = 'flaha_refresh';
export const API_BASE = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';

export const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

/** Tokens stay in HttpOnly cookies — never in the JSON the browser sees (KD-18). */
export function publicSession(session: SessionResponse): { user: SessionResponse['user'] } {
  return { user: session.user };
}

export function hasTokenLeak(body: unknown): boolean {
  const text = JSON.stringify(body ?? {});
  return text.includes('access_token') || text.includes('refresh_token');
}
