import { cookies } from 'next/headers';
import { API_PREFIX } from '@flaha/inspect-api-client';
import { ACCESS_COOKIE, API_BASE } from './session';
import { staffApiDenial } from './upstream';

export async function photoResponse(path: string) {
  const denied = await staffApiDenial('GET', path);
  if (denied) return Response.json(denied.json, { status: denied.status, headers: { 'Cache-Control': 'private, no-store' } });
  return streamApiImage(path);
}

export async function streamApiImage(path: string) {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  // Only the configured API receives the credential. Never follow a media redirect.
  const res = await fetch(API_BASE + API_PREFIX + path, {
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    redirect: 'manual', cache: 'no-store',
  });
  if (!res.ok || !res.body) {
    void res.body?.cancel().catch(() => undefined);
    return new Response(null, { status: res.status >= 400 ? res.status : 502, headers });
  }
  const type = res.headers.get('content-type')?.split(';')[0];
  const imageType = type && ['image/jpeg', 'image/png', 'image/webp'].includes(type);
  return new Response(res.body, { headers: {
    ...headers, 'Content-Type': imageType ? type : 'application/octet-stream',
    'Content-Disposition': imageType ? 'inline' : 'attachment',
  } });
}