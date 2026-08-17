export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'inspector' | 'manager' | 'client';
  locale: string;
  isActive: boolean;
  tokenVersion: number;
};

export type RefreshRow = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBy: string | null;
};

export type AuthStore = {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  insertRefresh(row: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshRow>;
  findRefreshByHash(hash: string): Promise<RefreshRow | null>;
  rotateRefresh(args: {
    oldId: string;
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshRow>;
  revokeFamily(familyId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  setPasswordAndBumpVersion(userId: string, passwordHash: string): Promise<AuthUser>;
  writeAudit(args: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string;
    payload?: Record<string, unknown>;
    ip?: string;
  }): Promise<void>;
};

export function toPublicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    locale: user.locale,
    is_active: user.isActive,
  };
}
