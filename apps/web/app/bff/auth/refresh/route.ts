import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  REFRESH_COOKIE,
  applySessionCookies,
  clearSessionCookies,
  exchangeRefresh,
  safeNextPath,
} from '@/lib/session';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNextPath(url.searchParams.get('next'));
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    const login = new URL('/login', url.origin);
    login.searchParams.set('next', next);
    const res = NextResponse.redirect(login);
    clearSessionCookies(res.cookies);
    return res;
  }
  const tokens = await exchangeRefresh(refresh);
  if (!tokens) {
    const login = new URL('/login', url.origin);
    login.searchParams.set('next', next);
    const res = NextResponse.redirect(login);
    clearSessionCookies(res.cookies);
    return res;
  }
  applySessionCookies(jar, tokens);
  return NextResponse.redirect(new URL(next, url.origin));
}
