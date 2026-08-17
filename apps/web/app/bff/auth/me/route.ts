import { NextResponse } from 'next/server';
import { upstream } from '@/lib/upstream';

export async function GET() {
  const { status, json } = await upstream('GET', '/auth/me');
  return NextResponse.json(json, { status });
}
