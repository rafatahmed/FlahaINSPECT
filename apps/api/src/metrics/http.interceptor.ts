import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { recordHttp } from './registry';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const route = routeLabel(req);
    if (route === '/metrics' || route.startsWith('/health')) {
      return next.handle();
    }
    const started = process.hrtime.bigint();
    res.once('finish', () => {
      const seconds = Number(process.hrtime.bigint() - started) / 1e9;
      recordHttp(req.method, route, res.statusCode || 0, seconds);
    });
    return next.handle();
  }
}

export function routeLabel(req: {
  route?: { path?: string };
  path?: string;
  originalUrl?: string;
}): string {
  const fromRoute = (req.route as { path?: string } | undefined)?.path;
  if (typeof fromRoute === 'string' && fromRoute.length > 0) {
    return fromRoute.startsWith('/') ? fromRoute : `/${fromRoute}`;
  }
  const raw = req.path ?? req.originalUrl ?? 'unknown';
  const path = raw.split('?')[0];
  return path.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ':id',
  );
}
