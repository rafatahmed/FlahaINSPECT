# `@flaha/inspect-api`

NestJS HTTP API.

- `GET /health` — process liveness
- `GET /health/ready` — Postgres TCP + MinIO live (503 if compose is down)
- `POST /internal/tus` — tusd hook stub (shared secret; real finalize is PR-07)

Auth and schema start in PR-03 / PR-04.

```bash
corepack pnpm --filter @flaha/inspect-api dev
# http://127.0.0.1:3001/health
```
