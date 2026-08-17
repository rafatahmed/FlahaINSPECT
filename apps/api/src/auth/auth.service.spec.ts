import argon2 from 'argon2';
import { AuthService } from './auth.service';
import { LoginLimiter } from './login-limiter';
import { hashRefreshToken } from './auth.tokens';
import type { AuthStore, AuthUser, RefreshRow } from './auth.types';

function user(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'manager@local.flaha',
    passwordHash: 'hash',
    fullName: 'Local Manager',
    role: 'manager',
    locale: 'en',
    isActive: true,
    tokenVersion: 1,
    ...over,
  };
}

function fakeStore(seed: { users?: AuthUser[]; refresh?: RefreshRow[] } = {}) {
  const users = [...(seed.users ?? [])];
  const refresh = [...(seed.refresh ?? [])];
  const store: AuthStore = {
    async findUserByEmail(email) {
      return users.find((u) => u.email === email) ?? null;
    },
    async findUserById(id) {
      return users.find((u) => u.id === id) ?? null;
    },
    async insertRefresh(row) {
      const created: RefreshRow = {
        id: `rt-${refresh.length + 1}`,
        userId: row.userId,
        tokenHash: row.tokenHash,
        familyId: row.familyId,
        expiresAt: row.expiresAt,
        revokedAt: null,
        replacedBy: null,
      };
      refresh.push(created);
      return created;
    },
    async findRefreshByHash(hash) {
      return refresh.find((r) => r.tokenHash === hash) ?? null;
    },
    async rotateRefresh(args) {
      const created: RefreshRow = {
        id: `rt-${refresh.length + 1}`,
        userId: args.userId,
        tokenHash: args.tokenHash,
        familyId: args.familyId,
        expiresAt: args.expiresAt,
        revokedAt: null,
        replacedBy: null,
      };
      refresh.push(created);
      const old = refresh.find((r) => r.id === args.oldId);
      if (old) {
        old.revokedAt = new Date();
        old.replacedBy = created.id;
      }
      return created;
    },
    async revokeFamily(familyId) {
      for (const row of refresh) {
        if (row.familyId === familyId && !row.revokedAt) {
          row.revokedAt = new Date();
        }
      }
    },
    async revokeAllForUser(userId) {
      for (const row of refresh) {
        if (row.userId === userId && !row.revokedAt) {
          row.revokedAt = new Date();
        }
      }
    },
    async setPasswordAndBumpVersion(userId, passwordHash) {
      const target = users.find((u) => u.id === userId);
      if (!target) throw new Error('missing');
      target.passwordHash = passwordHash;
      target.tokenVersion += 1;
      await store.revokeAllForUser(userId);
      return target;
    },
    async writeAudit() {
      return;
    },
  };
  return { store, users, refresh };
}

describe('AuthService', () => {
  const secret = 'test-access-secret';

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = secret;
    process.env.CLIENT_ROLE_ENABLED = 'false';
  });

  it('logs in a manager and returns tokens', async () => {
    const passwordHash = await argon2.hash('super-secret-password', {
      type: argon2.argon2id,
    });
    const { store } = fakeStore({ users: [user({ passwordHash })] });
    const svc = new AuthService(store, new LoginLimiter());
    const result = await svc.login({
      email: 'Manager@local.flaha',
      password: 'super-secret-password',
      ip: '10.0.0.1',
    });
    expect(result.access_token).toBeTruthy();
    expect(result.refresh_token).toHaveLength(64);
    expect(result.user.role).toBe('manager');
  });

  it('uses the same UNAUTHORIZED copy for unknown emails', async () => {
    const { store } = fakeStore();
    const svc = new AuthService(store, new LoginLimiter());
    await expect(
      svc.login({ email: 'ghost@x.test', password: 'whatever123', ip: '10.0.0.2' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('rejects reused refresh tokens and revokes the family', async () => {
    const u = user();
    const oldHash = hashRefreshToken('old-refresh-token-aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const { store, refresh } = fakeStore({
      users: [u],
      refresh: [
        {
          id: 'rt-1',
          userId: u.id,
          tokenHash: oldHash,
          familyId: 'fam-1',
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: new Date(),
          replacedBy: 'rt-2',
        },
      ],
    });
    const svc = new AuthService(store, new LoginLimiter());
    await expect(
      svc.refresh('old-refresh-token-aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '10.0.0.3'),
    ).rejects.toMatchObject({ code: 'TOKEN_REUSE_DETECTED' });
    expect(refresh.every((r) => r.revokedAt)).toBe(true);
  });

  it('set-password bumps token_version and revokes refresh families', async () => {
    const manager = user();
    const inspector = user({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'inspector@local.flaha',
      role: 'inspector',
      tokenVersion: 3,
    });
    const { store, refresh } = fakeStore({
      users: [manager, inspector],
      refresh: [
        {
          id: 'rt-i',
          userId: inspector.id,
          tokenHash: 'abc',
          familyId: 'fam-i',
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          replacedBy: null,
        },
      ],
    });
    const svc = new AuthService(store, new LoginLimiter());
    const result = await svc.setPassword(manager, inspector.id, 'brand-new-password');
    expect(inspector.tokenVersion).toBe(4);
    expect(refresh[0].revokedAt).not.toBeNull();
    expect(result.user.id).toBe(inspector.id);
  });

  it('forbids set-password for non-managers', async () => {
    const inspector = user({ role: 'inspector' });
    const { store } = fakeStore({ users: [inspector] });
    const svc = new AuthService(store, new LoginLimiter());
    await expect(
      svc.setPassword(inspector, inspector.id, 'brand-new-password'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
