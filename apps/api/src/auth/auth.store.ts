import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import { auditLogs, refreshTokens, users } from '../db/schema';
import type { AuthStore, AuthUser, RefreshRow } from './auth.types';

@Injectable()
export class DrizzleAuthStore implements AuthStore {
  constructor(@Inject('DB') private readonly db: Db) {}

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ? mapUser(rows[0]) : null;
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? mapUser(rows[0]) : null;
  }

  async insertRefresh(row: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshRow> {
    const [created] = await this.db
      .insert(refreshTokens)
      .values({
        userId: row.userId,
        tokenHash: row.tokenHash,
        familyId: row.familyId,
        expiresAt: row.expiresAt,
      })
      .returning();
    return mapRefresh(created);
  }

  async findRefreshByHash(hash: string): Promise<RefreshRow | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash))
      .limit(1);
    return rows[0] ? mapRefresh(rows[0]) : null;
  }

  async rotateRefresh(args: {
    oldId: string;
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshRow> {
    return this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(refreshTokens)
        .values({
          userId: args.userId,
          tokenHash: args.tokenHash,
          familyId: args.familyId,
          expiresAt: args.expiresAt,
        })
        .returning();
      await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date(), replacedBy: created.id })
        .where(eq(refreshTokens.id, args.oldId));
      return mapRefresh(created);
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }

  async setPasswordAndBumpVersion(userId: string, passwordHash: string): Promise<AuthUser> {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({
          passwordHash,
          tokenVersion: sql`${users.tokenVersion} + 1`,
        })
        .where(eq(users.id, userId))
        .returning();
      await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
      return mapUser(updated);
    });
  }

  async writeAudit(args: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string;
    payload?: Record<string, unknown>;
    ip?: string;
  }): Promise<void> {
    await this.db.insert(auditLogs).values({
      actorId: args.actorId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      payload: args.payload,
      ip: args.ip,
    });
  }
}

function mapUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    fullName: row.fullName,
    role: row.role,
    locale: row.locale,
    isActive: row.isActive,
    tokenVersion: row.tokenVersion,
  };
}

function mapRefresh(row: typeof refreshTokens.$inferSelect): RefreshRow {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    familyId: row.familyId,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    replacedBy: row.replacedBy,
  };
}
