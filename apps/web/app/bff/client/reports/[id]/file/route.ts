import { cookies } from 'next/headers';
import { rejectIfNotUuid } from '@/lib/bff';
import { ACCESS_COOKIE, API_BASE } from '@/lib/session';
import { API_PREFIX } from '@flaha/inspect-api-client';
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const invalid = rejectIfNotUuid(id);
  if (invalid) return invalid;
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const r = await fetch(API_BASE + API_PREFIX + `/client/reports/${id}/file`, {
    headers: token ? { authorization: 'Bearer ' + token } : {},
    cache: 'no-store',
    redirect: 'manual',
  });
  const headers = {
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
  };
  if (!r.ok || !r.body) {
    void r.body?.cancel().catch(() => undefined);
    return new Response(null, {
      status: r.status >= 400 ? r.status : 502,
      headers,
    });
  }
  return new Response(r.body, {
    headers: { ...headers, 'content-type': 'application/pdf' },
  });
}
