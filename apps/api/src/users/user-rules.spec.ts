import { assertCreatableRole, shouldBumpTokenVersion } from './user-rules';

describe('user-rules', () => {
  const previous = process.env.CLIENT_ROLE_ENABLED;

  afterEach(() => {
    process.env.CLIENT_ROLE_ENABLED = previous;
  });

  it('rejects creating a client while the flag is off', () => {
    process.env.CLIENT_ROLE_ENABLED = 'false';
    expect(() => assertCreatableRole('client')).toThrow();
  });

  it('bumps token_version only when role actually changes', () => {
    expect(shouldBumpTokenVersion('inspector', 'manager')).toBe(true);
    expect(shouldBumpTokenVersion('inspector', 'inspector')).toBe(false);
    expect(shouldBumpTokenVersion('inspector', undefined)).toBe(false);
  });
});
