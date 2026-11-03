import { NextResponse } from 'next/server';
import { isUuid } from './ids';
import { hasTokenLeak } from './session';

export function rejectIfNotUuid(id: string): NextResponse | null {
  if (isUuid(id)) return null;
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Invalid id' } },
    { status: 400 },
  );
}

export function jsonWithoutSecrets(json: unknown, status: number): NextResponse {
  if (hasTokenLeak(json)) {
    return NextResponse.json(
      { error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Invalid response' } },
      { status: 500 },
    );
  }
  return NextResponse.json(json, { status });
}
