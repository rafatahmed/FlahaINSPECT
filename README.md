# FlahaINSPECT

Offline-first field inspection platform for **Flaha Agri Tech** landscape, farm, irrigation, and softscape work in Qatar.

Field inspectors capture geotagged photos with a single category (**Defect** / **Normal** / **Note**), optional notes, and GPS accuracy metadata. Data is stored locally first and synced when connectivity returns. Managers review color-coded maps on a web dashboard, edit remarks/procedures/status, and export client-ready PDF reports.

**Core field loop:** Login → Select project → High-accuracy GPS → Photo + category → Save offline → Sync → Dashboard edit → PDF report.

---

## Status

| Item | State |
|------|--------|
| Product name | **FlahaINSPECT** |
| Repository | R1 in progress — R1-01–R1-04 merged; R1-05 on `feat/pr-05-users-projects` |
| Current release | **R1 in progress** — R0 tag `r0-design-freeze` |
| Design of record | [`Docs/FlahaINSPECT - Technical Design (MVP).md`](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) |
| Plan / tracking | [`Docs/ROADMAP.md`](Docs/ROADMAP.md) |
| Gaps | [`Docs/GAPS.md`](Docs/GAPS.md) |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) |
| UX of record | [`Docs/Wireframes/`](Docs/Wireframes/) |

---

## Planned stack

| Layer | Technology |
|-------|------------|
| Mobile | Flutter (`com.flaha.inspect`) — offline-first, Drift SQLite, TUS photo upload |
| API | NestJS — JWT auth, projects, inspections, sync, reports |
| Worker | Separate Node process — PDF, thumbnails, durable jobs table |
| Web | Next.js (App Router) + Tailwind + Leaflet — manager dashboard |
| Data | PostgreSQL + PostGIS, S3-compatible object storage, tusd |
| Node monorepo | pnpm + Turborepo (`apps/api`, `apps/web`, `apps/worker`, `packages/*`) |
| Mobile layout | Sibling Flutter app under `apps/mobile` (own toolchain/CI) |

Layout (PR-01 scaffold; Compose is PR-02):

```text
FlahaINSPECT/
  apps/
    api/                 # @flaha/inspect-api (NestJS)
    worker/              # @flaha/inspect-worker
    web/                 # @flaha/inspect-web (Next.js)
    mobile/              # Flutter sibling — NOT in pnpm/turbo
  packages/
    api-client/          # @flaha/inspect-api-client (codegen from PR-05)
  infra/                 # docker-compose: PostGIS, private MinIO, tusd, api, worker
  Docs/
  openapi/
  Makefile
```

---

## Documentation

Start at [`Docs/README.md`](Docs/README.md). Short map:

| Document | Purpose |
|----------|---------|
| [Technical Design (MVP)](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) | **Design of record** — schema, API, sync, security, PR plan |
| [Roadmap](Docs/ROADMAP.md) | Phases R0–R3, release exit criteria, work-item tracking |
| [Gaps](Docs/GAPS.md) | Residual decisions and finishing register |
| [Changelog](CHANGELOG.md) | What changed; how to record future changes |
| [Wireframes](Docs/Wireframes/) | **UX of record** for R1/R2 |
| [Overview](Docs/FlahaINSPECT%20-%20OverView.md) | Non-normative feasibility notes |
| [System Schematics](Docs/FlahaINSPECT%20-%20System%20Schematics.md) | Non-normative sketch |
| [Offline sync](Docs/FlahaINSPECT%20-%20Offline%20sync.md) | Non-normative |
| [Resumable photo uploads](Docs/FlahaINSPECT%20-%20Resumable%20photo%20uploads.md) | Non-normative |
| [Offline map tile caching](Docs/FlahaINSPECT%20-%20Offline%20map%20tile%20caching.md) | Non-normative |
| [External GNSS receivers](Docs/FlahaINSPECT%20-%20External%20GNSS%20receivers.md) | Non-normative, **post-MVP** |
| [Photo/ images](Docs/Photo/) | Mood only — not acceptance |

---

## Repository hygiene

This repo is set up for a secure monorepo baseline:

- **`.gitignore`** — secrets, build artifacts, Flutter/Node/Docker local data
- **`.gitattributes`** — LF in repo, binary assets, Linguist documentation flags
- **`.editorconfig`** — consistent indentation and charset
- **`SECURITY.md`** — vulnerability reporting

**Do not commit:** `.env` files, private keys, keystores, Firebase/Google service account JSON, real production credentials, or local Postgres/MinIO volume data.

---

## Getting started

1. Read the [Roadmap](Docs/ROADMAP.md) then the [Technical Design (MVP)](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md).
2. Node **20+** and **pnpm 9** (`corepack enable` then `corepack prepare pnpm@9.15.9 --activate`, or `corepack pnpm`).
3. Flutter SDK only if you work in `apps/mobile` — see [apps/mobile/README.md](apps/mobile/README.md).
4. Keep secrets out of git. Copy `.env.example` → `.env` and change the dev placeholders.

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build

# or
make install lint test typecheck build

cp .env.example .env
make up          # PostGIS, private MinIO, tusd, api, worker
make smoke       # /health and /health/ready
make migrate-twice
SEED_PASSWORD=dev-seed-only-change-me make seed
make down

corepack pnpm --filter @flaha/inspect-api dev     # :3001/health (host, no compose)
corepack pnpm --filter @flaha/inspect-web dev     # :3000
corepack pnpm --filter @flaha/inspect-worker dev

# mobile (Flutter CLI; not turbo)
make mobile-get mobile-analyze mobile-test
```

---

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities. Field photos and site locations are sensitive operational data — treat them as confidential by default.

---

## License

Proprietary — Flaha Agri Tech. All rights reserved unless a license file is added later.
