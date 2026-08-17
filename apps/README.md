# Apps

| Path | Stack | Toolchain |
|------|--------|-----------|
| `api/` | NestJS HTTP API (`@flaha/inspect-api`) | pnpm + turbo |
| `worker/` | NestJS job-process stub (`@flaha/inspect-worker`) | pnpm + turbo |
| `web/` | Next.js App Router (`@flaha/inspect-web`) | pnpm + turbo |
| `mobile/` | Flutter (`com.flaha.inspect`) | **Flutter CLI only** — not in `pnpm-workspace.yaml` |

Compose (`infra/`) arrives in PR-02. Do not add `apps/mobile` to the pnpm workspace.
