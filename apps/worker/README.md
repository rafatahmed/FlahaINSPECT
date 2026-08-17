# `@flaha/inspect-worker`

Separate Node process for durable jobs (thumbnails, PDF, orphan GC).

Claims `generate_thumbnail`, `generate_report`, and daily `gc_orphan_object` (48h unreferenced objects; G-05 archive default 12 months).

```bash
corepack pnpm --filter @flaha/inspect-worker dev
```
