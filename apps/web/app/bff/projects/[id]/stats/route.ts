import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { status, json } = await upstream('GET', `/projects/${id}/stats`);
  return NextResponse.json(json, { status });
}
