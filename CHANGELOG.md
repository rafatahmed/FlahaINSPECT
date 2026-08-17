# Changelog

All notable changes to FlahaINSPECT are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [SemVer](https://semver.org/) once application code exists.  
Until then, documentation freezes use the `r0-` tag series.

How to update: see [Docs/ROADMAP.md](Docs/ROADMAP.md#changelog-and-versioning).

---

## [Unreleased]

### Added

- Monorepo scaffold (PR-01 / R1-01): pnpm workspaces + Turborepo for `apps/api`, `apps/web`, `apps/worker`, `packages/api-client`.
- Flutter sibling at `apps/mobile` (`com.flaha.inspect`) — documented as **not** a turbo/pnpm package.
- GitHub Actions CI: Node lint/typecheck/test/build; separate Flutter analyze/test job.
- Makefile entry points; `GET /health` on the API stub.

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
