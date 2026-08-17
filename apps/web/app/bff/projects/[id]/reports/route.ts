import { NextResponse } from 'next/server';
import { stripDownloadUrl } from '@/lib/report-ui';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/projects/${id}/reports`);
  const body = json as { items?: Array<Record<string, unknown>> } | null;
  if (body?.items) {
    return NextResponse.json({ items: body.items.map(stripDownloadUrl) }, { status });
  }
  return NextResponse.json(json, { status });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { status, json } = await upstream('POST', `/projects/${id}/reports`, body);
  const payload = json as { report?: Record<string, unknown> } | null;
  if (payload?.report) {
    return NextResponse.json({ report: stripDownloadUrl(payload.report) }, { status });
  }
  return NextResponse.json(json, { status });
}
