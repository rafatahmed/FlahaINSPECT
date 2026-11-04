# `@flaha/inspect-api`

NestJS HTTP API.

- `GET /health` — process liveness
- `GET /health/ready` — Postgres TCP + MinIO live (503 if compose is down)
- `GET /metrics` — Prometheus text (HTTP, TUS, lag, job gauges)
- `POST /internal/tus` — tusd hooks (`pre-create` / `post-create` / `post-finish`; shared secret)

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

Users (manager, `/v1/users`): list, create, patch (role change bumps `token_version`).

Projects (`/v1/projects`): inspectors see assigned only; managers see all non-deleted. Archive vs soft-delete. Membership stores `member_role` but AuthZ ignores it (KD-33).

Photos (`/v1/photos`): register metadata + TUS `upload_token` (2h). Re-issue keeps `tus_upload_id` on same hash (KD-34). Hooks at `/internal/tus` finalize and enqueue `generate_thumbnail`.

Sync (`/v1/sync`): keyset delta `GET /projects` and `GET /projects/:id/points` (`since_updated_at` + `since_id`, limit 100/200). Soft-deletes only in `deleted_ids` (KD-38). Archived projects stay in `items`. Optional `POST /telemetry`.

OpenAPI: `openapi/flaha-inspect-v1.yaml`.

```bash
corepack pnpm --filter @flaha/inspect-api dev
# http://127.0.0.1:3001/health
```

## Numbered inspection capture

New Expo observations add four fields to the existing observation-create payload:
session_client_uuid, session_device_id, session_started_at and observation_number.
Supply all four together; observation_number is a positive 32-bit integer.
The first accepted observation registers the session atomically. The authenticated
actor owns it; project/device/start time are immutable. Same capture retries keep
identity and number; conflicting session/number reuse returns 409.

The server returns session_client_uuid and observation_number in observation
detail, list and delta-sync results. Legacy payloads remain supported with null
session/number; no visits or numbers are invented for historical records.
Apply migration 0004 before enabling this capture UI. Older APIs reject the new
fields or fail the client's numbering acknowledgement check; local evidence stays
queued. Session end and sync-completeness workflows are not part of this slice.

Disposable PostgreSQL regression: node --test infra/e2e/inspection-sessions.test.cjs
after migrating the isolated database twice with DISPOSABLE_REPORT_TEST=1.
Browser acceptance: node infra/e2e/web-numbered-capture.cjs with disposable seeded
accounts, API_BASE_URL, WEB_URL, SEED_PASSWORD, DISPOSABLE_FINDINGS_TEST=1 and
PW_RUNTIME/CHROME_PATH as needed. Do not use a shared or production database.

## Inspection session lifecycle

`POST /v1/inspection-sessions` registers an owning inspector/phone visit (client_uuid, project_id, device_id, started_at). An identical retry preserves identity.
`POST /v1/inspection-sessions/:id/end` freezes ended_at, allocated_count and observations (client_uuid, observation_number, photo_client_uuid, disposition saved/deleted). The final inventory is immutable; missing historical allocations cannot establish completeness. The request validates at most 10,000 inventory entries and remains subject to the server request-body limit.
`POST /v1/inspection-sessions/:id/sync-state` accepts device_id, a monotonically increasing sequence, pending/failed counts and complete. Completion requires an ended, fully accounted inventory and ready server photos; removed entries are not counted as uploaded photos. Rejected requests leave the prior state unchanged.
`GET /v1/projects/:id/inspection-sessions` reports authorized sessions, lifecycle, last contact and last-known counts. A disconnected/active session is never inferred complete from an empty server queue. Clients cannot access this staff endpoint.

Apply migration 0005 to the API before deploying the session-aware app. Existing numbered and legacy evidence remain valid; old APIs cannot accept lifecycle operations, so new clients retain evidence and explain the compatibility/access failure. Administrative closure and removal workflows are separate tickets.
