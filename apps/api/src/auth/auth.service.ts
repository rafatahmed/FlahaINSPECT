import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import { LoginLimiter } from './login-limiter';
import {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  hashRefreshToken,
  mintRefreshToken,
  signAccessToken,
} from './auth.tokens';
import type { AuthStore, AuthUser } from './auth.types';
import { toPublicUser } from './auth.types';

const BAD_CREDENTIALS = 'Email or password is incorrect.';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_STORE') private readonly store: AuthStore,
    @Inject(LoginLimiter) private readonly limiter: LoginLimiter,
  ) {}

  async login(input: { email: string; password: string; ip: string }) {
    const email = input.email.trim().toLowerCase();
    this.limiter.assertCanAttempt(input.ip, email);
    this.limiter.recordAttempt(input.ip);

    const user = await this.store.findUserByEmail(email);
    const passwordOk = user
      ? await argon2.verify(user.passwordHash, input.password).catch(() => false)
      : false;

    if (!user || !passwordOk || !user.isActive) {
      this.limiter.recordFailure(email);
      throw new ApiException(ErrorCode.UNAUTHORIZED, undefined, BAD_CREDENTIALS);
    }

    if (user.role === 'client' && process.env.CLIENT_ROLE_ENABLED !== 'true') {
      throw new ApiException(ErrorCode.FORBIDDEN, undefined, 'Client login is disabled');
    }

    this.limiter.recordSuccess(email);
    const tokens = await this.issueSession(user);
    await this.store.writeAudit({
      actorId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      ip: input.ip,
    });
    return { ...tokens, user: toPublicUser(user) };
  }

  async refresh(rawToken: string, ip: string) {
    const hash = hashRefreshToken(rawToken);
    const existing = await this.store.findRefreshByHash(hash);
    if (!existing) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    if (existing.revokedAt) {
      await this.store.revokeFamily(existing.familyId);
      await this.store.writeAudit({
        actorId: existing.userId,
        action: 'auth.token_reuse',
        entityType: 'refresh_token',
        entityId: existing.id,
        ip,
      });
      throw new ApiException(ErrorCode.TOKEN_REUSE_DETECTED);
    }
    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }

    const user = await this.store.findUserById(existing.userId);
    if (!user || !user.isActive) {
      await this.store.revokeFamily(existing.familyId);
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }

    const next = mintRefreshToken();
    await this.store.rotateRefresh({
      oldId: existing.id,
      userId: user.id,
      tokenHash: next.hash,
      familyId: existing.familyId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    });
    return {
      access_token: this.signAccess(user),
      refresh_token: next.raw,
      expires_in: ACCESS_TTL_SECONDS,
      user: toPublicUser(user),
    };
  }

  async logout(rawToken: string): Promise<void> {
    const existing = await this.store.findRefreshByHash(hashRefreshToken(rawToken));
    if (existing && !existing.revokedAt) {
      await this.store.revokeFamily(existing.familyId);
    }
  }

  async me(user: AuthUser) {
    return {
      user: toPublicUser(user),
      min_app_version: process.env.MIN_APP_VERSION ?? '0.0.1',
      server_time: new Date().toISOString(),
    };
  }

  async setPassword(actor: AuthUser, userId: string, newPassword: string) {
    if (actor.role !== 'manager') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    if (newPassword.length < 10) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'Password must be at least 10 characters');
    }
    const target = await this.store.findUserById(userId);
    if (!target) {
      throw new ApiException(ErrorCode.NOT_FOUND);
    }
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    const updated = await this.store.setPasswordAndBumpVersion(userId, passwordHash);
    return { user: toPublicUser(updated) };
  }

  private async issueSession(user: AuthUser) {
    const refresh = mintRefreshToken();
    await this.store.insertRefresh({
      userId: user.id,
      tokenHash: refresh.hash,
      familyId: randomUUID(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    });
    return {
      access_token: this.signAccess(user),
      refresh_token: refresh.raw,
      expires_in: ACCESS_TTL_SECONDS,
    };
  }

  private signAccess(user: AuthUser): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE, undefined, 'JWT_ACCESS_SECRET is not set');
    }
    return signAccessToken(
      { sub: user.id, role: user.role, email: user.email, ver: user.tokenVersion },
      secret,
    );
  }
}
