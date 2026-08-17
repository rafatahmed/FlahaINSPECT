import { Injectable } from '@nestjs/common';

/** Durable SQL job claim lands in PR-07 / PR-09. Scaffold only. */
@Injectable()
export class PollerService {
  readonly name = 'inspect-worker';

  status(): { service: 'worker'; ready: boolean } {
    return { service: 'worker', ready: true };
  }
}
