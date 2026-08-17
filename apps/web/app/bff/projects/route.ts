import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  const { status, json } = await upstream('GET', `/projects${qs}`);
  return NextResponse.json(json, { status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { status, json } = await upstream('POST', '/projects', body);
  return NextResponse.json(json, { status });
}
