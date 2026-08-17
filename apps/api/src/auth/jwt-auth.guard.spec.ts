import { JwtAuthGuard } from './jwt-auth.guard';
import { signAccessToken } from './auth.tokens';
import type { AuthStore, AuthUser } from './auth.types';

const actor: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'manager@local.flaha',
  passwordHash: 'x',
  fullName: 'Local Manager',
  role: 'manager',
  locale: 'en',
  isActive: true,
  tokenVersion: 2,
};

describe('JwtAuthGuard', () => {
  const secret = 'guard-secret';

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = secret;
  });

  function host(auth?: string) {
    const req = { headers: { authorization: auth }, user: undefined };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      req,
    };
  }

  it('rejects a valid JWT when token_version no longer matches', async () => {
    const token = signAccessToken(
      { sub: actor.id, role: actor.role, email: actor.email, ver: 1 },
      secret,
    );
    const store: Pick<AuthStore, 'findUserById'> = {
      findUserById: async () => actor,
    };
    const guard = new JwtAuthGuard(store as AuthStore);
    const ctx = host(`Bearer ${token}`);
    await expect(guard.canActivate(ctx as never)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('accepts a JWT whose ver matches the user row', async () => {
    const token = signAccessToken(
      { sub: actor.id, role: actor.role, email: actor.email, ver: 2 },
      secret,
    );
    const store: Pick<AuthStore, 'findUserById'> = {
      findUserById: async () => actor,
    };
    const guard = new JwtAuthGuard(store as AuthStore);
    const ctx = host(`Bearer ${token}`);
    await expect(guard.canActivate(ctx as never)).resolves.toBe(true);
    expect(ctx.req.user).toEqual(actor);
  });
});
