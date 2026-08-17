import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/inspection-points/${id}`);
  return NextResponse.json(json, { status });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { status, json } = await upstream('PATCH', `/inspection-points/${id}`, body);
  return NextResponse.json(json, { status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('DELETE', `/inspection-points/${id}`);
  return NextResponse.json(json ?? { ok: true }, { status });
}
