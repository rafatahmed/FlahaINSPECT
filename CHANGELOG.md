# Changelog

All notable changes to FlahaINSPECT are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [SemVer](https://semver.org/) once application code exists.  
Until then, documentation freezes use the `r0-` tag series.

How to update: see [Docs/ROADMAP.md](Docs/ROADMAP.md#changelog-and-versioning).

---

## [Unreleased]

### Added

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
