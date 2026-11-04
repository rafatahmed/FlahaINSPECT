import { NextResponse } from 'next/server';
import { rejectIfNotUuid } from '@/lib/bff';
import { staffApiDenial, upstream } from '@/lib/upstream';
import { fetchApiMedia } from '@/lib/upstream-media';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const invalid = rejectIfNotUuid(id);
  if (invalid) return invalid;
  const path = `/reports/${id}`;
  const denied = await staffApiDenial('GET', path);
  if (denied) return NextResponse.json(denied.json, { status: denied.status });
  let pdf = await fetchApiMedia(path + '/file');
  if (pdf.status === 404) {
    // Older APIs expose only the manager-authorized signed object.
    void pdf.body?.cancel().catch(() => undefined);
    const { status, json } = await upstream('GET', path);
    if (status >= 400) return NextResponse.json(json, { status });
    const report = (json as { report?: { status?: string; download_url?: string } })?.report;
    if (report?.status !== 'ready' || !report.download_url) return new Response(null, { status: 404 });
    pdf = await fetch(report.download_url, { redirect: 'error', cache: 'no-store' });
    if (!pdf.ok) { void pdf.body?.cancel().catch(() => undefined); return new Response(null, { status: 503 }); }
  }
  if (!pdf.ok || !pdf.body) {
    void pdf.body?.cancel().catch(() => undefined);
    return new Response(null, { status: pdf.status >= 400 ? pdf.status : 502 });
  }
  const headers = new Headers({ 'content-type': 'application/pdf', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' });
  if (new URL(req.url).searchParams.get('view') !== '1') {
    headers.set('content-disposition', `attachment; filename="flaha-report-${id}.pdf"`);
  }
  return new Response(pdf.body, { headers });
}
