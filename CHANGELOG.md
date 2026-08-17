# Changelog

All notable changes to FlahaINSPECT are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [SemVer](https://semver.org/) once application code exists.  
Until then, documentation freezes use the `r0-` tag series.

How to update: see [Docs/ROADMAP.md](Docs/ROADMAP.md#changelog-and-versioning).

---

## [Unreleased]

### Added

- Hardening (PR-16 / R2-16): `GET /metrics` (HTTP, TUS, lag, job gauges); daily `gc_orphan_object` (48h orphans, G-05 12-month archive default); compose e2e login→point→tus→list→PDF; [Docs/ops/pilot-checklist.md](Docs/ops/pilot-checklist.md).

- Web report UX (PR-15 / R2-15): Generate PDF, poll until ready/failed, 409 in-progress banner, download via `/bff/reports/:id/file`.

- Reports + Puppeteer worker (PR-09 / R2-09): manager `POST /projects/:id/reports` (202); KD-39 `409 REPORT_IN_PROGRESS`; 200-point cap; 15m job lease + reclaim; notes HTML-escaped; PDF key `reports/{project}/{id}.pdf`.

- Mobile map (PR-13 / R1-13): flutter_map, category markers, tile policy (KD-35 / G-01). Public OSM is ambient-only; bulk download requires `TILE_PROVIDER_URL`.
- Brand marks: color / black / white wordmarks on transparent backgrounds (`brand/`, web `public/brand/`, mobile `assets/brand/`).

### Changed

- CI node + compose jobs enable pnpm via corepack (no `pnpm/action-setup`). Same 429-at-Set-up-job class as `subosito/flutter-action`.
- Mobile Android pin: compile/target SDK 35, no NDK, Gradle heap 1.5 GiB (Flutter 3.47 defaults were API 36 + ~2 GiB NDK + 8 GiB heap).
- Web hydration: UTC timestamps; login `next` from the server; Leaflet stays client-only.
- Mobile login: HTTP 15s timeout; Android secure-storage `resetOnError`; 512px color mark (full-res stays in `brand/`).

### Added (earlier)

- Web cookie BFF, Leaflet dashboard, point editor (PR-14 / R1-14). HttpOnly cookies; media via `/bff/photos/:id`; category legend.

### Added (earlier)

- Outbox sync + TUS (PR-12 / R1-12): Sync now, Wi-Fi only, 2 MiB resumable PATCH, backoff, keyset pull after push.

### Added (earlier)

- Capture flow (PR-11 / R1-11): GPS soft-warn, pre-save pin adjust, one photo, 1920 JPEG 80 + EXIF strip, create-once outbox (`CreateInspectionPoint` + `UploadPhoto`).

### Added (earlier)

- Mobile Drift schema, Keychain/Keystore session store (KD-37), login, assigned project list (PR-10 / R1-10). Flutter SDK pin + committed Drift codegen.

### Added (earlier)

- Keyset delta sync (PR-08 / R1-08): `GET /sync/projects` and `GET /sync/projects/:id/points`. KD-38 split `items` / `deleted_ids`; OpenAPI freeze for mobile.

### Added (earlier)

- Photos + TUS hooks + thumbnail jobs (PR-07 / R1-07). Register state table (KD-34), parent `updated_at` bump, 10-minute signed URLs.

### Added (earlier)

- Inspection points API (PR-06 / R1-06): idempotent create (`ON CONFLICT DO NOTHING`), list/bbox, manager patch/soft-delete.

### Added (earlier)

- Users, projects, memberships (PR-05 / R1-05); inspector list is assignment-only; archive vs soft-delete.
- Typed `packages/api-client` covering auth + users + projects.

### Added (earlier)

- JWT auth (PR-04 / R1-04): login, refresh rotation + reuse detection, logout, `/me`, manager `set-password` (bumps `token_version`, revokes families).
- Error catalog filter and `openapi/flaha-inspect-v1.yaml`.
- KD-42 login lockout (10/min/IP + 10 failures/email/15 min).

### Added (earlier)

- PostGIS schema via Drizzle + raw SQL (PR-03 / R1-03): tables, triggers, `reports_one_active_per_project`, seed gated on `SEED_PASSWORD`.
- `make migrate` / `make migrate-twice` / `make seed`.

### Added (earlier)

- Local Compose stack (PR-02 / R1-02): PostGIS 16, private MinIO bucket, tusd, api, worker. No Redis.
- `.env.example` with `TILE_PROVIDER_URL` (KD-35) and `TUSD_HOOK_SECRET`.
- API `GET /health/ready` (db + storage) and stub `POST /internal/tus` hooks (secret required).
- CI compose smoke job; infra contract tests (no hook host port, private bucket, no Redis).

### Changed

- R1-01 marked **done** after merge of PR #13.
- R1-02 marked **done** after merge of PR #14.
- R1-03 marked **done** after merge of PR #15.
- R1-04 marked **done** after merge of PR #16.
- R1-05 marked **done** after merge of PR #17.
- R1-06 marked **done** after merge of PR #18.
- R1-07 marked **done** after merge of PR #19.
- R1-08 marked **done** after merge of PR #20.
- R1-10 marked **done** after merge of PR #21.
- R1-11 marked **done** after merge of PR #22.
- R1-12 marked **done** after merge of PR #23.
- R1-14 marked **done** after merge of PR #24.

---

## [r0-design-freeze] — 2026-08-17

Pre–PR-01 design freeze. No application source.

### Added

- `Docs/ROADMAP.md` — phases R0–R3, release exit criteria, work-item DAG, tracking rules.
- `Docs/GAPS.md` — finishing checklist and residual register (G-01 … G-12).
- `Docs/README.md` — read order; satellite docs marked non-normative.
- `Docs/Wireframes/` — UX of record (login, projects, map, capture, sync, dashboard, editor, PDF).
- `Docs/Photo/README.md` — AI mockups are mood only.
- Security reporting contact in `SECURITY.md`.

### Changed

- Technical Design status → **Design freeze (pre-PR-01)**.
- Satellite docs (`OverView`, `System Schematics`, offline sync, TUS, maps, GNSS) now carry a non-normative banner.
- System Schematics renamed from `FlahaINSPCT System Schematics.md` to `FlahaINSPECT - System Schematics.md`.
- README documentation index now points at roadmap, gaps, wireframes, and changelog.

### Locked (new Key Decisions)

- **KD-33** AuthZ uses `users.role` + membership assignment; `member_role` unused.
- **KD-34** TUS upload-token rotation does not clear `tus_upload_id` (resume survives 2h expiry).
- **KD-35** Public OSM is local/dev only; pilot/prod tiles must be contracted or self-hosted.
- **KD-36** Server stores operational 1920px JPEG; camera original stays on device (not forensic).
- **KD-37** Access/refresh tokens never stored in Drift / SQLite.
- **KD-38** Delta page splits `items` vs `deleted_ids`; no top-level `photos` array; project delete cascades locally.
- **KD-39** At most one queued/processing report per project (`REPORT_IN_PROGRESS`).
- **KD-40** Plain-text length caps; HTML-escape in web and PDF.
- **KD-41** Web media via BFF; do not rely on 10-minute signed URLs in the SPA.
- **KD-42** Login lockout: 10 failures per email per 15 minutes, plus 10/min/IP.

### Fixed (design defects closed)

- Drift schema no longer specifies session tokens in SQLite.
- TUS re-entry no longer instructed to wipe `tus_upload_id` on every token re-issue.
- Dual `photos` array vs embedded photo metadata in delta responses.
- Missing `token_version` bump on manager set-password.
- Unbounded report enqueue (double Puppeteer).
- Mockups contradicting forgot-password, GNSS, and category colors as if they were spec.

---

## [0.0.0] — 2026-08-07

Initial documentation drop (repo hygiene + exploratory docs + first TDD). Superseded by `r0-design-freeze` for anything that conflicted.
