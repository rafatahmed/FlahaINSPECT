# `@flaha/inspect-api`

NestJS HTTP API.

- `GET /health` — process liveness
- `GET /health/ready` — Postgres TCP + MinIO live (503 if compose is down)
- `POST /internal/tus` — tusd hook stub (shared secret; real finalize is PR-07)

Schema (PR-03): raw SQL in `drizzle/0001_init.sql`, Drizzle mirror in `src/db/schema.ts`.

```bash
make migrate-twice
SEED_PASSWORD=dev-seed-only-change-me make seed
```

Auth (PR-04), all under `/v1/auth`:

- `POST /login` `{ email, password }`
- `POST /refresh` `{ refresh_token }`
- `POST /logout` `{ refresh_token }` → 204
- `GET /me` Bearer access token
- `POST /set-password` manager only; bumps `token_version` and revokes refresh families

OpenAPI: `openapi/flaha-inspect-v1.yaml`.

```bash
corepack pnpm --filter @flaha/inspect-api dev
# http://127.0.0.1:3001/health
```
