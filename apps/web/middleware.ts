import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PATHNAME_HEADER } from './lib/session';

// Page guards authorize with /auth/me. Keep the original deep link for a
// relative refresh or login redirect, even behind a reverse proxy.
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(PATHNAME_HEADER, req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
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
