import { ERROR_CATALOG, ErrorCode } from './errors';

describe('error catalog', () => {
  it('includes every locked MVP code', () => {
    const required = [
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'TOKEN_REUSE_DETECTED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT_VERSION',
      'CONFLICT_IDEMPOTENCY',
      'PAYLOAD_TOO_LARGE',
      'PHOTO_PARENT_MISSING',
      'PHOTO_NOT_REGISTERED',
      'HASH_MISMATCH',
      'PHOTO_ALREADY_EXISTS',
      'REPORT_IN_PROGRESS',
      'PROJECT_ARCHIVED',
      'TEXT_TOO_LONG',
      'RATE_LIMITED',
      'ACCOUNT_LOCKED',
      'DEPENDENCY_UNAVAILABLE',
    ];
    for (const code of required) {
      expect(ERROR_CATALOG[code as ErrorCode]).toBeDefined();
    }
  });
});
