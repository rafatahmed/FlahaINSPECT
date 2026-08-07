# FlahaINSPECT

Offline-first field inspection platform for **Flaha Agri Tech** landscape, farm, irrigation, and softscape work in Qatar.

Field inspectors capture geotagged photos with a single category (**Defect** / **Normal** / **Note**), optional notes, and GPS accuracy metadata. Data is stored locally first and synced when connectivity returns. Managers review color-coded maps on a web dashboard, edit remarks/procedures/status, and export client-ready PDF reports.

**Core field loop:** Login → Select project → High-accuracy GPS → Photo + category → Save offline → Sync → Dashboard edit → PDF report.

---

## Status

| Item | State |
|------|--------|
| Product name | **FlahaINSPECT** (legacy docs may say FlahaINSPCT) |
| Repository | Docs + design baseline; application code not scaffolded yet |
| Design of record | [`Docs/FlahaINSPECT - Technical Design (MVP).md`](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) |

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

Target layout (from technical design):

```text
FlahaINSPECT/
  apps/
    api/                 # NestJS
    worker/              # background jobs
    web/                 # Next.js
    mobile/              # Flutter
  packages/
    api-client/          # OpenAPI-generated TS client
  infra/
    docker-compose.yml
  Docs/                  # product & design docs (current)
  openapi/
  Makefile
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Technical Design (MVP)](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) | Locked scope, architecture, schemas, API, PR plan |
| [Overview](Docs/FlahaINSPECT%20-%20OverView.md) | Product feasibility and roadmap notes |
| [System Schematics](Docs/FlahaINSPCT%20System%20Schematics.md) | Flow diagrams / system sketch |
| [Offline sync](Docs/FlahaINSPECT%20-%20Offline%20sync.md) | Outbox and sync strategy |
| [Resumable photo uploads](Docs/FlahaINSPECT%20-%20Resumable%20photo%20uploads.md) | TUS approach |
| [Offline map tile caching](Docs/FlahaINSPECT%20-%20Offline%20map%20tile%20caching.md) | Field maps without connectivity |
| [External GNSS receivers](Docs/FlahaINSPECT%20-%20External%20GNSS%20receivers.md) | Post-MVP precision GPS |
| [UI mockups](Docs/Photo/) | Dashboard and mobile screen references |

---

## Repository hygiene

This repo is set up for a secure monorepo baseline:

- **`.gitignore`** — secrets, build artifacts, Flutter/Node/Docker local data
- **`.gitattributes`** — LF in repo, binary assets, Linguist documentation flags
- **`.editorconfig`** — consistent indentation and charset
- **`SECURITY.md`** — vulnerability reporting

**Do not commit:** `.env` files, private keys, keystores, Firebase/Google service account JSON, real production credentials, or local Postgres/MinIO volume data.

---

## Getting started (when code lands)

Scaffolding will follow the technical design PR plan (monorepo + Docker Compose + Flutter app). Until then:

1. Read the [Technical Design (MVP)](Docs/FlahaINSPECT%20-%20Technical%20Design%20(MVP).md).
2. Keep secrets out of git; use `.env.example` patterns once apps exist.
3. Prefer **pnpm** for Node workspaces; Flutter via its own CLI in `apps/mobile`.

```bash
# After monorepo scaffold (not available yet)
# pnpm install
# make up          # docker compose: Postgres+PostGIS, MinIO, tusd, api, worker
# pnpm --filter @flaha/inspect-api dev
# pnpm --filter @flaha/inspect-web dev
# cd apps/mobile && flutter pub get && flutter run
```

---

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities. Field photos and site locations are sensitive operational data — treat them as confidential by default.

---

## License

Proprietary — Flaha Agri Tech. All rights reserved unless a license file is added later.
