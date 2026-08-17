import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ErrorCode } from './errors';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body && 'error' in body) {
        res.status(status).json(body);
        return;
      }
      if (status === HttpStatus.BAD_REQUEST) {
        res.status(status).json({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Bad request',
            details: typeof body === 'object' ? body : { message: body },
          },
        });
        return;
      }
      res.status(status).json({
        error: {
          code: status === 401 ? ErrorCode.UNAUTHORIZED : ErrorCode.VALIDATION_ERROR,
          message: typeof body === 'string' ? body : 'Request failed',
        },
      });
      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: ErrorCode.DEPENDENCY_UNAVAILABLE,
        message: 'Unexpected error',
      },
    });
  }
}
