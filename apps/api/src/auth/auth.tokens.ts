import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AccessClaims = {
  sub: string;
  role: string;
  email: string;
  ver: number;
};

export function signAccessToken(
  claims: AccessClaims,
  secret: string,
  ttlSeconds = ACCESS_TTL_SECONDS,
): string {
  return jwt.sign(claims, secret, { expiresIn: ttlSeconds });
}

export function verifyAccessToken(token: string, secret: string): AccessClaims {
  const payload = jwt.verify(token, secret);
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('invalid token');
  }
  const { sub, role, email, ver } = payload as AccessClaims;
  if (!sub || !role || !email || typeof ver !== 'number') {
    throw new Error('invalid claims');
  }
  return { sub, role, email, ver };
}

export function mintRefreshToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('hex');
  return { raw, hash: hashRefreshToken(raw) };
}

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}
