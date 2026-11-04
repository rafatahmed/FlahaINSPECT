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

**Historical release:** **R2 / v1.0.0** (2026-08-17). R0 tag: `r0-design-freeze`. For current priorities and readiness, use **Current delivery plan** below.

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

The original TDD non-goals remain historical context. Client access and issued reports are now approved and implemented as recorded below; GNSS, AI, path tracking, multi-photo UX, Redis and forensic originals are not added by this reconciliation.

---

## Current delivery plan (4 November 2026)

**Baseline:** main `276479a`, including merged PR #76. The R0/R1/R2 sections below are historical delivery records, not the current execution queue. A historical `done` status does not certify current Expo device or deployment acceptance.

**Current objective:** finish and verify the inspector-to-manager-to-client web workflow, then resume Expo device acceptance. Do not resume iPhone testing until the web acceptance below is recorded.

### Execute in this order

| Order | Work | Status / tracking | Exit evidence |
|---|---|---|---|
| 1 | Reconcile this roadmap and triage accumulated issues | In progress: [#73](https://github.com/rafatahmed/FlahaINSPECT/issues/73) | Each open issue has a disposition below; candidate closures are checked against original acceptance and approved before external updates. |
| 2 | Automate report acceptance in CI | Next: [#72](https://github.com/rafatahmed/FlahaINSPECT/issues/72) | Hosted runs execute queue/lease recovery, metadata projections and issued-revision acceptance against disposable services. Verify unchanged original PDF bytes, retries, rollback, downloads, cross-project denial and revocation. Expo-only changes still schedule no Docker/Flutter jobs. |
| 3 | Complete web release acceptance | Pending verification; owned by this roadmap | Record concurrent-edit conflicts, archive behavior, keyboard/narrow layouts, and inspector/manager/client workflow against the approved test environment. Record the deployed revision and migration state; repository merges alone do not establish deployment. Obtain approval before deployment/database changes. |
| 4 | Resume Expo implementation and device acceptance | Deferred until web acceptance: #63 and mobile triage below | Release state survives reopen/refresh; verify sync interruption/resume, offline recovery and actual issued PDF bytes. Record phone build and tested API revision. |
| 5 | Resolve legacy product scope | Backlog; not an implicit release blocker | Decide whether sessions, photo numbering, hierarchical classification and linked map/thumbnail triage belong in the next release before implementing their old issues. |

### What is already implemented

| Capability | Merged evidence | What remains |
|---|---|---|
| Role workspaces, session handling and protected photos | PR #55 (#52), #56 (#53) | Target-environment acceptance and remaining usability checks above. |
| Complete filtered observation results | PR #57 (#54); prior browser evidence includes 123 filtered matches | Legacy classification/filter requirements are separate scope, not automatically satisfied. |
| Finding release, client access and membership revocation | PR #59 (#58), #67 (#61/#62) | Browser release/revocation gate now runs in hosted CI; retain it. |
| Manager PDF generation, viewing, downloads and matching counts | PR #64 (#60/#38), #66 (#39/#40) | Move retained database regressions into CI under #72. Open defects means open plus in_progress. |
| Immutable issued client revisions | PR #68 (#65) | Local acceptance covered two revisions, frozen bytes, downloads, retries, rollback and revocation; host it under #72. Production migration is not established by these tests. |
| Exhausted lease recovery | PR #74 (#69), merge `4150ccd` | Real PostgreSQL regression passes locally; host under #72. Pre-existing stranded production records were not repaired. |
| PDF issuance pause | PR #75 (#70), merge `7cf69ea` | Regression tests run in normal API CI. Paused issuance returns 403 before evidence reads/writes; same-ID retry works after resuming. |
| Metadata-only report queries | PR #76 (#71), merge `276479a` | Local PostgreSQL tests exclude snapshots with 24 MiB of fixture content; host under #72. History pagination is unchanged. |
| Expo clean-checkout build and native profile implementation | PR #48 (#47); current source includes archive inputs and native profile rows | Device acceptance and legacy issue reconciliation below; do not equate a bundle check with phone verification. |

### Open issue triage

Snapshot: **22 open issues**. This is a triage snapshot, not 22 confirmed unfinished implementations. Keep the current queue above as the source of priority.

| Issues | Disposition | Required next action |
|---|---|---|
| #73 | Current documentation task | Reconcile merged evidence, queue and issue dispositions. |
| #72 | Next engineering task | Host report queue, metadata and issued-revision suites. |
| #63 | Confirmed Expo defect; deferred | Fix authoritative manager release state after web acceptance. |
| #41 | Keep open: archive acceptance outstanding | [.easignore](../apps/field/.easignore) includes all four originally missing inputs. PR #48 proves clean-checkout iOS export, not export from an inspected EAS archive. Inspect the archive and export from its contents before closure. |
| #46 | Keep open: implemented, partial device evidence | [Profile](../apps/field/profile-screen.tsx) selects [native rows](../apps/field/native-profile-rows.tsx); dependency is tracked. User reported full name/email/role read correctly at largest text size after installing build `9449d5f2-8190-419a-ade6-67bf3aba5892`. Small-device layout and all role/offline cases were not established by that report. |
| #37 | Keep open: source fix present, pilot acceptance outstanding | [App](../apps/field/App.tsx) omits onSync in capture-only mode; [list](../apps/field/inspection-list.tsx) hides the action and explains unavailability. Verify saved record/photo retention and sync-capable mode against the current pilot. |
| #42 | Keep open: native startup acceptance outstanding | [App](../apps/field/App.tsx) holds the splash through layout/logo loading and a timer. Fast/slow/failed restore and installed-build OS handoff still need a recorded device matrix. |
| #43 | Keep open: compact-device/keyboard acceptance outstanding | [Login](../apps/field/login-screen.tsx) disables idle bounce and preserves keyboard scrolling/focus. Verify small/regular heights, errors, enlarged text and keyboard submission. |
| #44 | Keep open: viewport acceptance outstanding | [Preview viewer](../apps/field/reports-preview.tsx) uses a bounded container with contain scaling and text/page controls. Record portrait/landscape checks; sample images do not prove actual issued PDF integration. |
| #45 | Keep open: public tunnel resume acceptance outstanding | Hosted loopback TUS success is not proof of public Expo-host HEAD/offset behavior. Reproduce resume on the same upload and token through the current public route, then verify released client photo bytes. |
| #8 | Recommend close as completed, after approval | Authentication supports JWT access, refresh rotation/reuse revocation, role guards and mobile secure storage. Fresh API tests and hosted role/browser tests support the original minimal-auth scope. See closure evidence below. |
| #7 | Recommend close as completed, after approval | Upload finalization enqueues thumbnails; worker creates linked JPEGs, supports retry and exposes status/metrics. Hosted evidence reaches ready. See closure evidence below. |
| #3 | Keep open: storage implementation present, full acceptance not established | Configurable S3, signed/private access, size validation and GC exist. Verify deletion synchronization and the original format-validation criteria before closing the whole issue. |
| #2 | Legacy scope decision required | Current schema covers projects, points, photos and jobs; session/photo numbering and field/zone/type hierarchy are not established. Do not close as fully implemented. |
| #4 | Legacy scope decision required | Inspector capture/TUS upload works. Original per-session auto-numbering and initially-unclassified workflow differ from current capture-time category selection. |
| #5 | Legacy scope decision required | Filtered/keyset observation queries exist; session and conditional-classification query requirements remain distinct from the merged pagination fix. |
| #6 | Legacy scope decision required | Current PATCH supports manager remarks/procedure/status; it does not establish the requested type1/type2/type3 and field/zone update contract. |
| #9 | Legacy scope decision required | Current map does not establish all numbered bearing arrows and two-way thumbnail-strip selection criteria. |
| #10 | Legacy scope decision required | Current dashboard/results do not establish the requested numbered vertical photo board and synchronized highlighting. |
| #11 | Legacy scope decision required | Current editor is category/status based; original conditional type1/type2/type3 dropdown rules require a product decision. |
| #12 | Legacy scope decision required | Current filtering and complete pagination do not establish unclassified-first, hierarchical classification, field/zone and linked-strip criteria. Future lasso selection was explicitly excluded from the original immediate scope. |
| #1 | Keep as historical umbrella pending child reconciliation | Update its checklist only after evidence-based child closures and explicit decisions on remaining legacy scope. It is not the execution queue. |

### Evidence supporting the proposed closures

These are recommendations only: no issue state changes are part of this documentation PR.

- **#8, authentication:** [Auth service](../apps/api/src/auth/auth.service.ts), [JWT guard](../apps/api/src/auth/jwt-auth.guard.ts), [role guard](../apps/api/src/auth/roles.guard.ts) and [Expo session/API](../apps/field/api.ts) implement the original backend/mobile authentication requirement. The current manager role supplies the original admin intent; no additional admin role is needed to call this minimal-auth work complete. Fresh API suite: 79 tests passed, including auth, token-version revocation, lockout and project access. [PR #55](https://github.com/rafatahmed/FlahaINSPECT/pull/55) and [PR #56](https://github.com/rafatahmed/FlahaINSPECT/pull/56) record role/session delivery. This closes implementation scope, not all future device or security acceptance.
- **#7, thumbnails:** [Photo finalization](../apps/api/src/photos/photos.service.ts) queues `generate_thumbnail` and exposes protected thumbnail access; [thumbnail handler](../apps/worker/src/jobs/thumbnail.handler.ts) rotates/resizes and stores a linked JPEG; [poller](../apps/worker/src/poller/poller.service.ts) and [claimer](../apps/worker/src/jobs/claimer.ts) handle queued work/retries; [metrics](../apps/api/src/metrics/registry.ts) track job/dead-letter counts. JPEG satisfies the requested JPEG/WEBP output alternative. Fresh worker suite: 14 tests passed. The [hosted run on 29a2a2e](https://github.com/rafatahmed/FlahaINSPECT/actions/runs/41755585272) passed upload-to-PDF and browser release/revocation. Its [smoke fixture](../infra/e2e/pilot-smoke.mjs) requires photo ready before browser acceptance. This is existing hosted evidence, not a newly run failure-injection test of thumbnail processing.

After approval to close #7 and #8, the 22-issue snapshot would become 20; merging this PR with `Closes #73` would leave 19, assuming no other issue changes. Do not report those reduced counts until GitHub confirms them.

**Issue handling:** classify an issue as verified complete, implemented but awaiting acceptance, confirmed defect, or deferred scope. Every closure needs supporting evidence; superseding an issue must identify where any remaining criteria went. Do not close groups solely because nearby features were merged.

**Workspace caution:** the original local checkout has extensive uncommitted changes and diverges from main. Audit and delivery work use clean isolated worktrees. Preserve local work; do not infer missing repository features from that checkout or reset it as cleanup.

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
| R2-13 | PR-13 | flutter_map + FMTC | R1-10, R1-11, **G-01** | `done` | Wireframe 03 offline; no public OSM bulk |
| R2-15 | PR-15 | Web report UX | R2-09, R1-14 | `done` | Poll + download + 409 UI |
| R2-16 | PR-16 | Metrics, GC, e2e, ops runbook | R1-12, R2-15 | `done` | e2e login→point→tus→list→PDF; runbook in `Docs/ops/` |
| R2-17 | PR-17 | AR keys + capture polish | R1-11, R1-14 | `done` | Keys/RTL scaffold; contrast; accuracy UX |

**G-01 is decided (KD-43).** R2-13 offline pack is **done**. Do **not** ship a pilot device pointed at public OSM bulk download.

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
