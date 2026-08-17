import { canonicalPhotoKey, canonicalThumbKey, decidePhotoRegister } from './photo-register-state';

const point = 'point-1';
const req = { inspectionPointId: point, sha256: 'aa'.repeat(32), byteSize: 100 };

describe('decidePhotoRegister', () => {
  it('inserts when no row exists', () => {
    expect(
      decidePhotoRegister({ existing: null, request: req, pointHasOtherPhoto: false }),
    ).toEqual({ kind: 'insert', http: 201 });
  });

  it('rejects a second photo on the same point', () => {
    expect(
      decidePhotoRegister({ existing: null, request: req, pointHasOtherPhoto: true }),
    ).toEqual({ kind: 'photo-exists', http: 409 });
  });

  it('keeps tus_upload_id when re-issuing the same hash (KD-34)', () => {
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: point,
          status: 'pending_upload',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: req,
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'reissue-keep-tus', http: 200 });
  });

  it('clears tus session after a failed upload even with the same hash', () => {
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: point,
          status: 'failed',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: req,
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'reissue-clear-tus', http: 200, refreshMeta: false });
  });

  it('refreshes metadata and clears tus when hash/size change before ready', () => {
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: point,
          status: 'uploading',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: { ...req, byteSize: 200 },
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'reissue-clear-tus', http: 200, refreshMeta: true });
  });

  it('is a no-op for processing and ready', () => {
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: point,
          status: 'processing',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: req,
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'noop', http: 200, includeUrls: false });
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: point,
          status: 'ready',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: { ...req, sha256: 'bb'.repeat(32) },
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'noop', http: 200, includeUrls: true });
  });

  it('uses locked S3 key shapes', () => {
    expect(canonicalPhotoKey('proj', 'pt', 'ph')).toBe('photos/proj/pt/ph.jpg');
    expect(canonicalThumbKey('proj', 'pt', 'ph')).toBe('thumbs/proj/pt/ph_512.jpg');
  });

  it('conflicts when the same client_uuid is bound to another point', () => {
    expect(
      decidePhotoRegister({
        existing: {
          inspectionPointId: 'other-point',
          status: 'pending_upload',
          sha256: req.sha256,
          byteSize: 100,
        },
        request: req,
        pointHasOtherPhoto: false,
      }),
    ).toEqual({ kind: 'conflict-point', http: 409 });
  });
});
