import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  REFRESH_COOKIE, applySessionCookies, clearSessionCookies, exchangeRefresh, safeNextPath,
} from '@/lib/session';

export async function GET(req: Request) {
  const next = safeNextPath(new URL(req.url).searchParams.get('next'));
  const refresh = (await cookies()).get(REFRESH_COOKIE)?.value;
  const tokens = refresh ? await exchangeRefresh(refresh) : null;
  const location = tokens ? next : '/login?' + new URLSearchParams({ next });
  const response = new NextResponse(null, {
    status: 307, headers: { Location: location, 'Cache-Control': 'private, no-store' },
  });
  if (tokens) applySessionCookies(response.cookies, tokens);
  else clearSessionCookies(response.cookies);
  return response;
}