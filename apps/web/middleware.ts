import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_HEADER,
  PATHNAME_HEADER,
  REFRESH_COOKIE,
  applySessionCookies,
  clearSessionCookies,
  exchangeRefresh,
} from './lib/session';

const PROTECTED = ['/dashboard', '/points', '/projects', '/users', '/reports', '/client', '/'];

function loginRedirect(req: NextRequest, pathname: string) {
  const login = req.nextUrl.clone();
  login.pathname = '/login';
  login.searchParams.set('next', pathname);
  const res = NextResponse.redirect(login);
  clearSessionCookies(res.cookies);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(ACCESS_HEADER);
  requestHeaders.set(PATHNAME_HEADER, pathname);

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) {
    return loginRedirect(req, pathname);
  }

  if (access) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const tokens = await exchangeRefresh(refresh as string);
  if (!tokens) {
    return loginRedirect(req, pathname);
  }

  requestHeaders.set(ACCESS_HEADER, tokens.access_token);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  applySessionCookies(res.cookies, tokens);
  return res;
}

export const config = {
  matcher: [
    '/',
    '/client/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/points/:path*',
    '/projects',
    '/projects/:path*',
    '/users',
    '/users/:path*',
    '/reports',
    '/reports/:path*',
  ],
};
