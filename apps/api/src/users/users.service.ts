import { Inject, Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { eq, sql } from 'drizzle-orm';
import type { AuthStore } from '../auth/auth.types';
import { toPublicUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { users } from '../db/schema';
import {
  assertCreatableRole,
  normalizeEmail,
  normalizeName,
  shouldBumpTokenVersion,
} from './user-rules';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DB') private readonly db: Db,
    @Inject('AUTH_STORE') private readonly authStore: AuthStore,
  ) {}

  async list() {
    const rows = await this.db.select().from(users);
    return { items: rows.map(toPublicRow) };
  }

  async create(input: {
    email: string;
    full_name: string;
    password: string;
    role?: 'inspector' | 'manager' | 'client';
    locale?: string;
  }) {
    const email = normalizeEmail(input.email);
    const fullName = normalizeName(input.full_name);
    const role = input.role ?? 'inspector';
    assertCreatableRole(role);
    const existing = await this.authStore.findUserByEmail(email);
    if (existing) {
      throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY, undefined, 'Email already exists');
    }
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const [created] = await this.db
      .insert(users)
      .values({
        email,
        fullName,
        passwordHash,
        role,
        locale: input.locale ?? 'en',
      })
      .returning();
    return { user: toPublicRow(created) };
  }

  async patch(
    id: string,
    input: {
      full_name?: string;
      is_active?: boolean;
      role?: 'inspector' | 'manager' | 'client';
      locale?: string;
    },
  ) {
    const current = await this.authStore.findUserById(id);
    if (!current) {
      throw new ApiException(ErrorCode.NOT_FOUND);
    }
    if (input.role) {
      assertCreatableRole(input.role);
    }
    const bump = shouldBumpTokenVersion(current.role, input.role);
    const [updated] = await this.db
      .update(users)
      .set({
        ...(input.full_name !== undefined ? { fullName: normalizeName(input.full_name) } : {}),
        ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
        ...(bump ? { tokenVersion: sql`${users.tokenVersion} + 1` } : {}),
      })
      .where(eq(users.id, id))
      .returning();
    if (bump) {
      await this.authStore.revokeAllForUser(id);
    }
    return { user: toPublicRow(updated) };
  }
}

function toPublicRow(row: typeof users.$inferSelect) {
  return toPublicUser({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    fullName: row.fullName,
    role: row.role,
    locale: row.locale,
    isActive: row.isActive,
    tokenVersion: row.tokenVersion,
  });
}
