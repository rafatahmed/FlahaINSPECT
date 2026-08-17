import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  const { status, json } = await upstream('GET', `/inspection-points${qs}`);
  return NextResponse.json(json, { status });
}
