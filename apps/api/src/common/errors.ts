export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT_VERSION: 'CONFLICT_VERSION',
  CONFLICT_IDEMPOTENCY: 'CONFLICT_IDEMPOTENCY',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  PHOTO_PARENT_MISSING: 'PHOTO_PARENT_MISSING',
  PHOTO_NOT_REGISTERED: 'PHOTO_NOT_REGISTERED',
  HASH_MISMATCH: 'HASH_MISMATCH',
  PHOTO_ALREADY_EXISTS: 'PHOTO_ALREADY_EXISTS',
  REPORT_IN_PROGRESS: 'REPORT_IN_PROGRESS',
  PROJECT_ARCHIVED: 'PROJECT_ARCHIVED',
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  RATE_LIMITED: 'RATE_LIMITED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  DEPENDENCY_UNAVAILABLE: 'DEPENDENCY_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ERROR_CATALOG: Record<
  ErrorCode,
  { status: number; message: string }
> = {
  VALIDATION_ERROR: { status: 400, message: 'Bad request' },
  UNAUTHORIZED: { status: 401, message: 'Missing or invalid token' },
  TOKEN_REUSE_DETECTED: {
    status: 401,
    message: 'Refresh token reuse detected; family revoked',
  },
  FORBIDDEN: { status: 403, message: 'Insufficient permissions' },
  NOT_FOUND: { status: 404, message: 'Not found' },
  CONFLICT_VERSION: { status: 409, message: 'Point version mismatch' },
  CONFLICT_IDEMPOTENCY: { status: 409, message: 'Idempotency conflict' },
  PAYLOAD_TOO_LARGE: { status: 413, message: 'Payload too large' },
  PHOTO_PARENT_MISSING: { status: 422, message: 'Parent inspection point missing' },
  PHOTO_NOT_REGISTERED: { status: 422, message: 'Photo is not registered' },
  HASH_MISMATCH: { status: 422, message: 'Photo hash mismatch' },
  PHOTO_ALREADY_EXISTS: { status: 409, message: 'Photo already exists for this point' },
  REPORT_IN_PROGRESS: {
    status: 409,
    message: 'A report is already queued or processing for this project',
  },
  PROJECT_ARCHIVED: { status: 422, message: 'Project is archived' },
  TEXT_TOO_LONG: { status: 422, message: 'Text field exceeds maximum length' },
  RATE_LIMITED: { status: 429, message: 'Too many requests' },
  ACCOUNT_LOCKED: {
    status: 429,
    message: 'Try again in 15 minutes',
  },
  DEPENDENCY_UNAVAILABLE: { status: 503, message: 'Dependency unavailable' },
};
