import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';

/** KD-42: 10 login requests / IP / minute and 10 failures / email / 15 minutes. */
export class LoginLimiter {
  private readonly ipHits = new Map<string, number[]>();
  private readonly failures = new Map<string, number[]>();

  constructor(
    private readonly ipLimit = 10,
    private readonly ipWindowMs = 60_000,
    private readonly failLimit = 10,
    private readonly failWindowMs = 15 * 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  assertCanAttempt(ip: string, email: string): void {
    const t = this.now();
    const ipHits = this.prune(this.ipHits.get(ip), t, this.ipWindowMs);
    if (ipHits.length >= this.ipLimit) {
      throw new ApiException(ErrorCode.RATE_LIMITED);
    }
    const fails = this.prune(this.failures.get(email), t, this.failWindowMs);
    if (fails.length >= this.failLimit) {
      throw new ApiException(ErrorCode.ACCOUNT_LOCKED);
    }
  }

  recordAttempt(ip: string): void {
    const t = this.now();
    const hits = this.prune(this.ipHits.get(ip), t, this.ipWindowMs);
    hits.push(t);
    this.ipHits.set(ip, hits);
  }

  recordFailure(email: string): void {
    const t = this.now();
    const fails = this.prune(this.failures.get(email), t, this.failWindowMs);
    fails.push(t);
    this.failures.set(email, fails);
  }

  recordSuccess(email: string): void {
    this.failures.delete(email);
  }

  private prune(times: number[] | undefined, now: number, windowMs: number): number[] {
    return (times ?? []).filter((stamp) => now - stamp < windowMs);
  }
}
