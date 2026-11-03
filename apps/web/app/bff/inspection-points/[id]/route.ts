import { NextResponse } from 'next/server';
import { jsonWithoutSecrets, rejectIfNotUuid } from '@/lib/bff';
import { stripSignedMedia } from '@/lib/report-ui';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bad = rejectIfNotUuid(id);
  if (bad) return bad;
  const { status, json } = await upstream('GET', `/inspection-points/${id}`);
  return jsonWithoutSecrets(stripSignedMedia(json), status);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bad = rejectIfNotUuid(id);
  if (bad) return bad;
  const body = await req.json().catch(() => ({}));
  const { status, json } = await upstream('PATCH', `/inspection-points/${id}`, body);
  return jsonWithoutSecrets(stripSignedMedia(json), status);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bad = rejectIfNotUuid(id);
  if (bad) return bad;
  const { status, json } = await upstream('DELETE', `/inspection-points/${id}`);
  return jsonWithoutSecrets(json ?? { ok: true }, status);
}
