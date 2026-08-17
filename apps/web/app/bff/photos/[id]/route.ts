import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/photos/${id}`);
  if (status >= 400) return NextResponse.json(json, { status });
  const photo = (json as { photo?: { url?: string | null } }).photo;
  if (!photo?.url) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Photo still uploading' } }, { status: 404 });
  }
  return NextResponse.redirect(photo.url);
}
