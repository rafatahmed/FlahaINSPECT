import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRole, mayUseStaffApi } from './workspace';
import { API_PREFIX } from '@flaha/inspect-api-client';
import {
  ACCESS_COOKIE,
  API_BASE,
  PATHNAME_HEADER,
  REFRESH_COOKIE,
  applySessionCookies,
  exchangeRefresh,
  safeNextPath,
} from './session';

async function requestUpstream(
  method: string,
  path: string,
  body?: unknown,
  opts?: { persistCookies?: boolean },
): Promise<{ status: number; json: unknown }> {
  const persistCookies = opts?.persistCookies !== false;
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
    const refresh = jar.get(REFRESH_COOKIE)?.value;
    if (!refresh) {
      const json = await res.json().catch(() => null);
      return { status: res.status, json };
    }
    // RSC cannot cookies().set — bounce through the BFF so rotation is persisted (KD-34).
    if (!persistCookies) {
      redirect(`/bff/auth/refresh?next=${encodeURIComponent(safeNextPath((await headers()).get(PATHNAME_HEADER)))}`);
    }
    const next = await exchangeRefresh(refresh);
    if (next) {
      applySessionCookies(jar, next);
      res = await send(next.access_token);
    }
  }
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, json };
}

export async function staffApiDenial(method: string, path: string) {
  const response = await requestUpstream('GET', '/auth/me');
  if (response.status !== 200) return response;
  const role = (response.json as { user?: { role?: unknown } } | null)?.user?.role;
  if (!isRole(role) || !mayUseStaffApi(role, method, path)) {
    return { status: 403, json: { error: { code: 'FORBIDDEN', message: 'Access denied' } } };
  }
  return null;
}

export async function upstream(method: string, path: string, body?: unknown) {
  if (path !== '/auth/me') {
    const denied = await staffApiDenial(method, path);
    if (denied) return denied;
  }
  return requestUpstream(method, path, body);
}

/** For Server Components. Never writes cookies. */
export function pageUpstream(method: string, path: string, body?: unknown) {
  return requestUpstream(method, path, body, { persistCookies: false });
}
