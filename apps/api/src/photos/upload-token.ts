import jwt from 'jsonwebtoken';

export const UPLOAD_TOKEN_TTL_SECONDS = 2 * 60 * 60;

export type UploadTokenClaims = {
  photo_id: string;
  photo_client_uuid: string;
  project_id: string;
  byte_size: number;
};

export function signUploadToken(claims: UploadTokenClaims, secret: string): string {
  return jwt.sign(claims, secret, { expiresIn: UPLOAD_TOKEN_TTL_SECONDS });
}

export function verifyUploadToken(token: string, secret: string): UploadTokenClaims {
  const payload = jwt.verify(token, secret);
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('invalid');
  }
  const { photo_id, photo_client_uuid, project_id, byte_size } = payload as UploadTokenClaims;
  if (!photo_id || !photo_client_uuid || !project_id || typeof byte_size !== 'number') {
    throw new Error('invalid claims');
  }
  return { photo_id, photo_client_uuid, project_id, byte_size };
}

export function extractBearer(header: string | undefined): string | undefined {
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}
