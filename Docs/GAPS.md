# FlahaINSPECT — gaps, finishing, and decision register

**Status date:** 2026-08-17  
**Owner:** Flaha engineering (Rafat)  
**Companion:** [ROADMAP.md](./ROADMAP.md) · [Technical Design](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) · [CHANGELOG.md](../CHANGELOG.md)

This file is the only place residual unknowns live. If a topic is **not** listed here, treat it as locked in the TDD.

**Status values:** `open` · `blocked` · `decided` · `accepted-risk` · `done`

---

## Pre–PR-01 finishing (R0)

| ID | Item | Status | Notes |
|----|------|--------|--------|
| R0-01 | Mark satellite docs non-normative | **done** | Banner on every exploratory doc |
| R0-02 | Rename Schematics off `FlahaINSPCT` | **done** | `Docs/FlahaINSPECT - System Schematics.md` |
| R0-03 | Patch TDD (tokens, TUS resume, roles, reports, validation, URLs, delta) | **done** | KD-33 … KD-42 |
| R0-04 | Lock originals vs compressed (evidence class) | **done** | KD-36 — operational, not forensic |
| R0-05 | Lock tile-provider *policy* | **done** | KD-35 — vendor name still G-01 |
| R0-06 | UX of record (annotated wireframes) | **done** | `Docs/Wireframes/`; `Docs/Photo/` is mood |
| R0-07 | Real security contact | **done** | `SECURITY.md` |
| R0-08 | Roadmap + changelog + this register | **done** | This release |

R0 exit: all rows above `done`. **PR-01 may start.**

---

## Locked in this freeze (do not reopen without a changelog entry)

| KD | Decision | Implication |
|----|----------|-------------|
| KD-33 | AuthZ = `users.role` + membership assignment | Ignore `member_role` in MVP |
| KD-34 | Token rotation does not reset TUS session | Resume works after 2h token expiry |
| KD-35 | Dev OSM only; pilot/prod contracted or self-hosted tiles | Blocks PR-13 *device* build, not PR-01 |
| KD-36 | Server stores 1920px JPEG; camera original stays on device | Do not sell “forensic originals” in R1/R2 |
| KD-37 | Access/refresh tokens never in Drift | Keychain / Keystore only |
| KD-38 | Delta split `items` / `deleted_ids`; no top-level photos array | Project delete cascades locally |
| KD-39 | One active PDF job per project | 409 `REPORT_IN_PROGRESS` |
| KD-40 | 4000-char plain text; HTML-escape web/PDF | No rich text |
| KD-41 | Web media via BFF, not long-lived signed `src` | |
| KD-42 | Login lockout 10 failures / email / 15 min | Plus 10/min/IP |

---

## Open gaps (tracked)

### Blocks a later PR or a real-world pilot — not PR-01

| ID | Gap | Blocks | Status | Default until decided | Owner |
|----|-----|--------|--------|------------------------|-------|
| G-01 | Named tile vendor or self-hosted tile URL for staging/prod | PR-13 **device/pilot build** | `open` | Local/dev: OSM ambient only, no bulk scrape | Platform |
| G-02 | Production cloud region / data residency confirmation | First **external-client** data (not internal Flaha pilot) | `open` | KD-30: single region nearest Flaha ops | Legal + platform |
| G-04 | App distribution (MDM vs store) | Devices leaving staging | `open` | Internal sideload / TestFlight / internal Play for R1 | Mobile |
| G-05 | Retention months after project archive | PR-16 GC job numbers | `open` | 12 months of **upload candidates** (`RETENTION_ARCHIVE_MONTHS`, wired in PR-16) | Ops |
| G-07 | SQLCipher + file-at-rest required? | First **external-client** pilot | `open` | Internal Flaha R1: accepted risk (KD-29) | Owner |

### Does not block R1 or R2

| ID | Gap | Status | When |
|----|-----|--------|------|
| G-03 | SSO (Azure AD / Google) | `open` | R3 |
| G-06 | Enable `client` login / shared PDFs | `open` | R3 |
| G-08 | Forensic originals (`store_originals`) | `decided` for R1/R2 = **no** | Revisit only if legal/sales require |
| G-09 | Full Arabic field strings + RTL QA | scaffold in PR-17 | Complete language pack in R3 |
| G-10 | Manager correction of field `category` / `note` / location | `accepted-risk` | Create-once (KD-23). Wrong capture is permanent in R1/R2. |
| G-11 | WorkManager / iOS BGTasks true background upload | `decided` out of R1/R2 | Foreground + Sync Now is the supported path |
| G-12 | Per-project roles (`member_role` live) | `decided` unused | Schema kept; AuthZ ignores it |

---

## Accepted risks (do not “fix” in R1)

| Risk | Why accepted | Review trigger |
|------|----------------|----------------|
| Unencrypted local photo files | SQLCipher does not cover files; encrypting files is a product/UX project | External client data on devices (G-07) |
| No field edit after Save | Removes an undefined sync path | Repeated field complaints after 2 internal projects |
| 7-day refresh, no MFA | Pilot is internal Flaha staff | External inspectors or manager accounts on the public internet |
| OSM in local/dev | Fine for engineers | **Never** point a pilot device at public OSM bulk download |
| AI mockups look like the product | Replaced by wireframes as UX of record | Anyone quoting mockup copy as a requirement |

---

## How to close a gap

1. Write the decision in one paragraph (what / why / what it unblocks).
2. Add a **Key Decision** row to the TDD if it changes implementation.
3. Set the G- row to `decided` or `done` here.
4. Add a `CHANGELOG.md` entry under `[Unreleased]`.
5. If it changes a release exit criterion, edit `ROADMAP.md` in the same commit.

Do **not** leave decisions only in chat.
