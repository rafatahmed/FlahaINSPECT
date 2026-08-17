import { ApiException } from '../common/api-exception';
import { LoginLimiter } from './login-limiter';

describe('LoginLimiter', () => {
  it('rate-limits the 11th login from the same IP within a minute', () => {
    const now = 1_000_000;
    const limiter = new LoginLimiter(10, 60_000, 10, 15 * 60_000, () => now);
    for (let i = 0; i < 10; i += 1) {
      limiter.assertCanAttempt('1.1.1.1', `user${i}@x.test`);
      limiter.recordAttempt('1.1.1.1');
    }
    expect(() => limiter.assertCanAttempt('1.1.1.1', 'other@x.test')).toThrow(ApiException);
    try {
      limiter.assertCanAttempt('1.1.1.1', 'other@x.test');
    } catch (err) {
      expect((err as ApiException).code).toBe('RATE_LIMITED');
    }
  });

  it('locks an email after 10 failures in 15 minutes (unknown emails included)', () => {
    const limiter = new LoginLimiter();
    const email = 'nobody@x.test';
    for (let i = 0; i < 10; i += 1) {
      limiter.assertCanAttempt('9.9.9.9', email);
      limiter.recordAttempt('9.9.9.9');
      limiter.recordFailure(email);
    }
    try {
      limiter.assertCanAttempt('8.8.8.8', email);
      fail('expected lock');
    } catch (err) {
      expect((err as ApiException).code).toBe('ACCOUNT_LOCKED');
    }
  });

  it('clears failures after a success', () => {
    const limiter = new LoginLimiter();
    const email = 'ok@x.test';
    for (let i = 0; i < 9; i += 1) {
      limiter.recordFailure(email);
    }
    limiter.recordSuccess(email);
    expect(() => limiter.assertCanAttempt('2.2.2.2', email)).not.toThrow();
  });
});
