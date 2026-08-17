import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './lib/session';

const PROTECTED = ['/dashboard', '/points', '/projects', '/users', '/reports'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  if (req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get(REFRESH_COOKIE)?.value) {
    return NextResponse.next();
  }
  const login = req.nextUrl.clone();
  login.pathname = '/login';
  login.searchParams.set('next', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
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
