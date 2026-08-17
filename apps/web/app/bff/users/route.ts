import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET() {
  const { status, json } = await upstream('GET', '/users');
  return NextResponse.json(json, { status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { status, json } = await upstream('POST', '/users', body);
  return NextResponse.json(json, { status });
}
