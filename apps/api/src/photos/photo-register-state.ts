export type PhotoStatus =
  | 'pending_upload'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed';

export type RegisterDecision =
  | { kind: 'insert'; http: 201 }
  | { kind: 'reissue-keep-tus'; http: 200 }
  | { kind: 'reissue-clear-tus'; http: 200; refreshMeta: boolean }
  | { kind: 'noop'; http: 200; includeUrls: boolean }
  | { kind: 'conflict-point'; http: 409 }
  | { kind: 'photo-exists'; http: 409 };

export function decidePhotoRegister(args: {
  existing: {
    inspectionPointId: string;
    status: PhotoStatus;
    sha256: string;
    byteSize: number;
  } | null;
  request: {
    inspectionPointId: string;
    sha256: string;
    byteSize: number;
  };
  pointHasOtherPhoto: boolean;
}): RegisterDecision {
  const { existing, request, pointHasOtherPhoto } = args;
  if (existing && existing.inspectionPointId !== request.inspectionPointId) {
    return { kind: 'conflict-point', http: 409 };
  }
  if (!existing && pointHasOtherPhoto) {
    return { kind: 'photo-exists', http: 409 };
  }
  if (!existing) {
    return { kind: 'insert', http: 201 };
  }
  if (existing.status === 'processing') {
    return { kind: 'noop', http: 200, includeUrls: false };
  }
  if (existing.status === 'ready') {
    return { kind: 'noop', http: 200, includeUrls: true };
  }
  const same =
    existing.sha256.toLowerCase() === request.sha256.toLowerCase() &&
    existing.byteSize === request.byteSize;
  if (existing.status === 'failed' && same) {
    return { kind: 'reissue-clear-tus', http: 200, refreshMeta: false };
  }
  if ((existing.status === 'pending_upload' || existing.status === 'uploading') && same) {
    return { kind: 'reissue-keep-tus', http: 200 };
  }
  return { kind: 'reissue-clear-tus', http: 200, refreshMeta: true };
}

export function canonicalPhotoKey(projectId: string, pointId: string, photoId: string): string {
  return `photos/${projectId}/${pointId}/${photoId}.jpg`;
}

export function canonicalThumbKey(projectId: string, pointId: string, photoId: string): string {
  return `thumbs/${projectId}/${pointId}/${photoId}_512.jpg`;
}
