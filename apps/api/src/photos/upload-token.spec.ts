import { extractBearer, signUploadToken, UPLOAD_TOKEN_TTL_SECONDS, verifyUploadToken } from './upload-token';

describe('upload-token', () => {
  const claims = {
    photo_id: 'p1',
    photo_client_uuid: 'c1',
    project_id: 'proj',
    byte_size: 1024,
  };

  it('round-trips claims with a 2h TTL (token rotate, not TUS reset)', () => {
    expect(UPLOAD_TOKEN_TTL_SECONDS).toBe(2 * 60 * 60);
    const token = signUploadToken(claims, 'secret');
    expect(verifyUploadToken(token, 'secret')).toEqual(claims);
  });

  it('rejects a token signed with another secret', () => {
    const token = signUploadToken(claims, 'secret');
    expect(() => verifyUploadToken(token, 'other')).toThrow();
  });

  it('extracts Bearer tokens', () => {
    expect(extractBearer('Bearer abc')).toBe('abc');
    expect(extractBearer('abc')).toBeUndefined();
  });
});
