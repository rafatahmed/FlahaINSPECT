# FlahaINSPECT roadmap

**Design of record:** [Technical Design (MVP)](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md)  
**Residual unknowns:** [GAPS.md](./GAPS.md)  
**What shipped in docs:** [CHANGELOG.md](../CHANGELOG.md)  
**UX of record:** [Wireframes](./Wireframes/)

This file is the implementation plan you track against. Do not invent a second plan in chat or in satellite docs.

---

## How to use this file

| You want to… | Do this |
|--------------|---------|
| Know what “done” means | Read **Outcomes** + the release **Exit criteria** (they are testable) |
| Start work | Take the next `not-started` work item whose dependencies are `done` |
| Finish a work item | Check its **Done when** list; set Status `done`; add a CHANGELOG line |
| Change scope | Update TDD + this file + GAPS + CHANGELOG **in the same commit** |
| See blockers | Anything `blocked` or a G- id in [GAPS.md](./GAPS.md) |

**Status values:** `not-started` · `in-progress` · `blocked` · `done` · `deferred`

**Current release in progress:** **R2**. R0 tag: `r0-design-freeze`. R1 merged. Next: R2-17 i18n + capture polish.

---

## Product outcome (why this exists)

Field inspectors on Flaha landscape / farm / irrigation / softscape sites in Qatar capture geotagged evidence **without network**, and managers turn that into an edited map + client PDF **without WhatsApp dumps**.

**Core loop (unchanged):**  
Login → Select project → High-accuracy GPS → Photo + Defect/Normal/Note → Save offline → Sync → Dashboard edit → PDF.

### Goals that count as success (from TDD)

| ID | Goal | First release that must meet it |
|----|------|----------------------------------|
| O-1 | Local save always succeeds (disk permitting); no network required to capture | R1 |
| O-2 | ≥95% of captures eventually sync without re-entry | R1 (measured on internal project) |
| O-3 | Median metadata time-to-sync &lt; 30s after reconnect **while app is foregrounded or Sync now is used** | R1 |
| O-4 | Photo upload resumes after app kill mid-upload (same `tus_upload_id`) | R1 |
| O-5 | One-point capture (photo + category) &lt; 15s after GPS fix | R1 |
| O-6 | Manager edits remarks / procedure / status; field `note` stays read-only | R1 |
| O-7 | Manager PDF for ≤100 points in &lt; 2 minutes after photos `ready` | R2 |
| O-8 | Offline map usable for one prepared project (licensed tiles) | R2 |
| O-9 | Confidential: private storage, membership, no public photo URLs | R1 |

Non-goals stay in the TDD Non-goals table (GNSS, AI, path, client portal, multi-photo UX, Redis, forensic originals).

---

## Release train

```
R0 Design freeze ──► R1 Slim pilot ──► R2 Full MVP ──► R3 After MVP
   (docs only)         (internal)        (client-sendable PDF)   (GNSS, client login, AR, SSO…)
```

| Release | Name | Audience | App code? | Target effort | Window (2 engineers) |
|---------|------|----------|-----------|---------------|----------------------|
| **R0** | Design freeze | Authors | No | This commit | **Done 2026-08-17** |
| **R1** | Slim pilot | Internal Flaha inspectors + 1 manager | Yes | PR-01–08, 10–12, 14 (~40 ed) | ~8–10 weeks |
| **R2** | Full MVP | Managers send PDFs to clients (Flaha-operated) | Yes | +PR-09, 13, 15–17 (~18 ed) | +3–5 weeks |
| **R3** | After MVP | External extras | Yes | Not scheduled | After R2 retrospective |

Dates after R0 are **effort-based**, not calendar promises. Recalculate when staffing ≠ 2 engineers.

---

## R0 — Design freeze

**Purpose:** One contract so PR-01 does not start from contradictory docs.  
**Status:** `done` (2026-08-17)

### Exit criteria (all met)

- [x] Satellite docs marked non-normative; Schematics renamed off `FlahaINSPCT`
- [x] TDD patches: KD-33 … KD-42
- [x] Evidence class locked (operational JPEG, not forensic original)
- [x] Tile *policy* locked (KD-35); source named **KD-43** (self-hosted TileServer GL)
- [x] Wireframes replace AI mockups as UX of record
- [x] `SECURITY.md` has a real contact
- [x] This roadmap + GAPS + CHANGELOG exist

**R0 does not include application source.** That is R1 / PR-01.

---

## R1 — Slim pilot (internal)

**Purpose:** One internal project, real devices, capture → sync → manager edit.  
**Out of R1:** PDF, offline tile packs, Arabic UI, GNSS, client login.

### Exit criteria (DoD) — all must be true on a real device + staging

1. Inspector logs in (01), sees assigned projects (02), captures a point with photo + category offline (04).
2. After Save, row exists locally with `pending` even in airplane mode.
3. Foreground **Sync now** (05) pushes metadata then TUS photo; app kill mid-photo **resumes** the same TUS session.
4. Manager dashboard (06) shows the point before the photo may be `ready`; thumb appears when `ready`.
5. Manager edits remarks / procedure / status (07); field note cannot be changed.
6. Retry of the same `client_uuid` does not bump `updated_at` (no delta storms).
7. Tokens are not in SQLite (KD-37). tusd hooks are not on a public port.
8. O-2, O-3, O-4, O-5 measured on that project and written into CHANGELOG.

### Work items (track here)

Dependencies are hard. Do not start a row whose deps are not `done`.

| ID | PR | Work item | Deps | Status | Done when |
|----|-----|-----------|------|--------|-----------|
| R1-01 | PR-01 | Monorepo scaffold, CI skeleton, Flutter sibling | R0 | `done` | `apps/api|web|worker|mobile` exist; pnpm turbo for Node; mobile documented as sibling; CI lint/test placeholders green |
| R1-02 | PR-02 | Compose: PostGIS, private MinIO, tusd, api/worker stubs | R1-01 | `done` | `make up` healthy; hook ports internal; `.env.example`; `TILE_PROVIDER_URL` placeholder |
| R1-03 | PR-03 | Drizzle + raw SQL schema, triggers, seeds | R1-02 | `done` | Migration applies twice (expand-safe); seed uses `SEED_PASSWORD`; unique active-report index |
| R1-04 | PR-04 | Auth + OpenAPI + error catalog | R1-03 | `done` | Login/refresh/logout/me/set-password; rotation + reuse revoke; `ver`; lockout; set-password revokes families |
| R1-05 | PR-05 | Users, projects, memberships, api-client | R1-04 | `done` | Manager CRUD; inspector list assigned; bbox from boundary; archive vs soft-delete |
| R1-06 | PR-06 | Inspection points API | R1-05 | `done` | Idempotent create KD-31; manager PATCH only remarks/procedure/status; KD-40 lengths |
| R1-07 | PR-07 | Photos + TUS hooks + thumbs | R1-06, R1-02 | `done` | State table + **KD-34**; parent `updated_at` bump; private hooks |
| R1-08 | PR-08 | Keyset delta freeze | R1-06, R1-07 | `done` | KD-38; OpenAPI frozen for mobile; `PROJECT_ARCHIVED` |
| R1-10 | PR-10 | Mobile Drift, secure login, project list | R1-04, R1-05 | `done` | Wireframe 01+02; no tokens in Drift |
| R1-11 | PR-11 | Capture + GPS + one photo + outbox | R1-10 | `done` | Wireframe 04; EXIF GPS strip; create-once |
| R1-12 | PR-12 | Sync worker + TUS (push then delta) | R1-07 (push), R1-08 (delta) | `done` | Wireframe 05; resume after kill; Wi-Fi only |
| R1-13 | PR-13 | Mobile map + tile policy (G-01) | R1-10, R1-11 | `done` | Category markers; no OSM bulk; TILE_PROVIDER_URL gate |
| R1-14 | PR-14 | Web BFF, map, editor | R1-04–R1-08 | `done` | Wireframe 06+07; KD-41 media; category legend |

**Parallelism that is actually safe**

- After R1-05: R1-06 (API) and R1-10 (mobile shell) can overlap.
- After R1-07: R1-08 and mobile push milestone of R1-12 can overlap.
- R1-14 starts only after R1-08 (need delta + embeds).

**R1 tracking changelog:** every merged PR gets a `CHANGELOG.md` entry under `[Unreleased]` → moved to `[0.1.0]` (or the tag you cut) when the exit criteria pass.

### R1 staffing note

If only **one** engineer: serialize API (01–08) then mobile (10–12) then web (14). Calendar ≈ 14–16 weeks. Do not cut TUS or idempotent create to “save time.”

---

## R2 — Full MVP

**Purpose:** Manager can send a client PDF; one project has a licensed offline map; pilot ops exist.

### Exit criteria

1. Manager generates PDF (08); ≤100 points ready in &lt; 2 minutes; 200 hard cap enforced.
2. Double-click generate does not spawn two Chromium jobs (KD-39).
3. One project offline map on device against **G-01** tile source; capture works with radio off.
4. Metrics: request latency, TUS hook results, job dead-letters, sync lag (TDD Observability).
5. Ops checklist live: daily Postgres backup, bucket versioning, 48h tusd purge, orphan GC.
6. EN UI complete; AR **resource keys** present (not a full linguistic QA).

### Work items

| ID | PR | Work item | Deps | Status | Done when |
|----|-----|-----------|------|--------|-----------|
| R2-09 | PR-09 | Reports + Puppeteer worker | R1-07, R1-03 | `done` | Lease/reclaim; KD-39; escaped text; 200 cap |
| R2-13 | PR-13 | flutter_map + FMTC | R1-10, R1-11, **G-01** | `not-started` | Wireframe 03 offline; no public OSM bulk |
| R2-15 | PR-15 | Web report UX | R2-09, R1-14 | `done` | Poll + download + 409 UI |
| R2-16 | PR-16 | Metrics, GC, e2e, ops runbook | R1-12, R2-15 | `done` | e2e login→point→tus→list→PDF; runbook in `Docs/ops/` |
| R2-17 | PR-17 | AR keys + capture polish | R1-11, R1-14 | `in-progress` | Keys/RTL scaffold; contrast; accuracy UX |

**G-01 is decided (KD-43):** self-hosted TileServer GL + Qatar extract. R2-13 (FMTC offline pack) can start. Do **not** ship a pilot device pointed at public OSM bulk download.

---

## R3 — After MVP (backlog only)

Do not pull these into R1/R2 without a written scope change.

| ID | Item | Depends on |
|----|------|------------|
| R3-01 | External GNSS (see GNSS satellite doc) | Field demand after 2+ projects |
| R3-02 | Client role login + shared PDF only | G-06, legal |
| R3-03 | Full Arabic linguistic pass | PR-17 keys |
| R3-04 | SSO | G-03 |
| R3-05 | `store_originals` forensic objects | G-08 + sales/legal |
| R3-06 | WorkManager / BGTasks | G-11 |
| R3-07 | Multi-photo per point (drop UNIQUE) | Product ask |
| R3-08 | Manager correction of category/note/location | G-10 |
| R3-09 | Path tracking, heatmaps, AI, Excel/GeoJSON | TDD non-goals |

---

## Phases vs PRs (one picture)

```
Phase A  Scaffold     R1-01, R1-02
Phase B  API core     R1-03 … R1-08
Phase C  Mobile R1    R1-10 … R1-12
Phase D  Web R1       R1-14          →  R1 release
Phase E  PDF          R2-09, R2-15
Phase F  Maps offline R2-13 (G-01)
Phase G  Harden       R2-16, R2-17   →  R2 release
```

Effort rollup matches the TDD PR plan (slim ~8–10 weeks @ 2 eng; full +3–5 weeks). If a PR slips, **slip the calendar, do not delete exit criteria.**

---

## Changelog and versioning

| Artifact | What it records |
|----------|-----------------|
| [CHANGELOG.md](../CHANGELOG.md) | Human-readable released changes (Keep a Changelog) |
| Git tags | `r0-design-freeze`, later `v0.1.0` (R1), `v1.0.0` (R2) |
| This file | Status column on work items |
| GAPS.md | Decisions that are still open |

### Rules

1. Every merged PR updates `CHANGELOG.md` `[Unreleased]`.
2. Cutting a release: retitle `[Unreleased]` → `[x.y.z] — YYYY-MM-DD`, set the matching work items `done`, write the measured O- metrics under that version.
3. A behavior change that is not in CHANGELOG **did not happen** as far as the project is concerned.
4. Do not keep a second roadmap in README. README links here.

### Suggested first tags

```text
r0-design-freeze   # this documentation freeze
v0.1.0             # R1 slim pilot DoD met
v1.0.0             # R2 full MVP DoD met
```

---

## What “100% correct” means here

The **path** to O-1 … O-9 is fully specified: locked TDD + wireframes + this DAG + exit tests.

These are **not** unknown product questions; they are **named blockers** with defaults:

- G-01 tile vendor — **decided KD-43** (self-hosted TileServer GL)
- G-02 residency (blocks external-client data)
- G-04 distribution (blocks store/MDM)
- G-05 retention months (blocks PR-16 numbers)
- G-07 encryption gate (blocks external-client devices)

They do **not** block PR-01 or an internal R1 on Flaha-owned sites.

If a new question appears, it goes into GAPS with an id **before** anyone codes around it.
