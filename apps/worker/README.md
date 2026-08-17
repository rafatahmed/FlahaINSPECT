# `@flaha/inspect-worker`

Separate Node process for durable jobs (thumbnails, PDF, orphan GC).

PR-01 starts an application context only. Claim/lease SQL arrives with PR-07 / PR-09.

```bash
corepack pnpm --filter @flaha/inspect-worker dev
```
