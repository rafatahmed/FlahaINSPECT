# Database (PR-03)

Authoritative DDL is **raw SQL** in `drizzle/0001_init.sql` (KD-16).  
`schema.ts` is the Drizzle mirror for later query builders — do not generate DDL from it.

```bash
# from repo root, with compose Postgres up
make migrate          # apply; safe to run twice
make migrate-twice    # acceptance: second pass is a no-op
SEED_PASSWORD=dev-seed-only-change-me make seed
```

Seed refuses `NODE_ENV=production` and requires `SEED_PASSWORD` (≥10 chars).
