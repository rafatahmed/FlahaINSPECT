import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

/** Stream the PDF through the BFF. Browser never sees the signed S3 URL. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/reports/${id}`);
  if (status >= 400) return NextResponse.json(json, { status });
  const report = (json as { report?: { status?: string; download_url?: string } }).report;
  if (report?.status !== 'ready' || !report.download_url) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Report is not ready' } },
      { status: 404 },
    );
  }
  const pdf = await fetch(report.download_url);
  if (!pdf.ok || !pdf.body) {
    return NextResponse.json(
      { error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Could not fetch PDF' } },
      { status: 503 },
    );
  }
  return new NextResponse(pdf.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="flaha-report-${id}.pdf"`,
    },
  });
}
