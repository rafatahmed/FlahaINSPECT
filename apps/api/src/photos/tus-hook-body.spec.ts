import { tusUploadFromHook, tusRequestHeader, uploadTokenFromHook } from './tus-hook-body';

describe('tusd v2 hook body', () => {
  it('reads Upload from Event (tusd v2.8) and from the root (tests)', () => {
    expect(
      tusUploadFromHook({
        Type: 'pre-create',
        Event: { Upload: { Size: 12, MetaData: { filename: 'a.png' } } },
      }).Size,
    ).toBe(12);
    expect(tusUploadFromHook({ Upload: { Size: 9 } }).Size).toBe(9);
  });

  it('takes the client Bearer from HTTPRequest.Header arrays', () => {
    const body = {
      Event: {
        Upload: { MetaData: { filetype: 'image/png' } },
        HTTPRequest: { Header: { Authorization: ['Bearer upload.jwt'] } },
      },
    };
    expect(tusRequestHeader(body, 'authorization')).toBe('Bearer upload.jwt');
    expect(uploadTokenFromHook(undefined, body)).toBe('upload.jwt');
  });

  it('accepts the raw metadata token the mobile client sends', () => {
    expect(
      uploadTokenFromHook(undefined, {
        Event: { Upload: { MetaData: { authorization: 'raw-token' } } },
      }),
    ).toBe('raw-token');
  });
});
