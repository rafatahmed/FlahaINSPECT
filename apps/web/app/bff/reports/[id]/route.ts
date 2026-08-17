import { NextResponse } from 'next/server';
import { stripDownloadUrl } from '@/lib/report-ui';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/reports/${id}`);
  const payload = json as { report?: Record<string, unknown> } | null;
  if (payload?.report) {
    return NextResponse.json({ report: stripDownloadUrl(payload.report) }, { status });
  }
  return NextResponse.json(json, { status });
}
