import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { status, json } = await upstream(
    'POST',
    `/inspection-sessions/${id}/close`,
    await req.json(),
  );
  return NextResponse.json(json, { status });
}
