import { HttpException } from '@nestjs/common';
import { ERROR_CATALOG, ErrorCode } from './errors';

export class ApiException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, details?: Record<string, unknown>, message?: string) {
    const spec = ERROR_CATALOG[code];
    super(
      {
        error: {
          code,
          message: message ?? spec.message,
          ...(details ? { details } : {}),
        },
      },
      spec.status,
    );
    this.code = code;
    this.details = details;
  }
}
