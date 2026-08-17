# `@flaha/inspect-web`

Next.js App Router manager dashboard.

- Login sets **HttpOnly** `flaha_access` / `flaha_refresh` (no tokens in `localStorage`).
- Pages call `/bff/*`; images use `/bff/photos/:id/thumb` (KD-41).
- Dashboard: Leaflet map, category legend (Defect/Normal/Note), filters, stats.
- Point editor: field note read-only; remarks / procedure / status + version.
- Reports: generate + poll; 409 shows the active job; PDF via `/bff/reports/:id/file`.

```bash
corepack pnpm --filter @flaha/inspect-web dev
# http://127.0.0.1:3000
```
