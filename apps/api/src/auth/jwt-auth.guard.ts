import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import { verifyAccessToken } from './auth.tokens';
import type { AuthStore } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject('AUTH_STORE') private readonly store: AuthStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    }
    let claims;
    try {
      claims = verifyAccessToken(token, secret);
    } catch {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    const user = await this.store.findUserById(claims.sub);
    if (!user || !user.isActive || user.tokenVersion !== claims.ver) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    req.user = user;
    return true;
  }
}
