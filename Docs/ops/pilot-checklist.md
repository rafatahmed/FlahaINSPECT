# Pilot ops checklist

Cadence for the internal Flaha R2 pilot. Defaults match the technical design. G-05 (retention months) is still open; GC uses **12 months** until Ops names another number (`RETENTION_ARCHIVE_MONTHS`).

| Item | Cadence | How |
|------|---------|-----|
| Postgres logical backup | Daily; keep 14 days | `pg_dump` (custom format) of `flaha_inspect`. Store off-box. Restore drill once before first external client. |
| MinIO / S3 versioning | At bucket create | Staging/prod buckets: versioning on. Local compose stays unversioned. |
| tusd incomplete purge | 48h | tusd config plus worker `gc_orphan_object` (prefix `uploads/`, objects older than `TUSD_INCOMPLETE_HOURS`, default 48). |
| Orphan object GC | Daily worker | Job type `gc_orphan_object`. Deletes unreferenced keys under `uploads/`, `photos/`, `thumbs/`, `reports/` after 48h. Deletes photo objects for projects archived longer than `RETENTION_ARCHIVE_MONTHS` (archive time = `projects.updated_at` when `is_archived`). |
| Log retention | 30 days | API/worker structured logs. Do not ship tokens. |
| Pause uploads | When storage cost spikes | Set `UPLOADS_ENABLED=false` on the API and restart. Register returns 403. |
| Pause PDF | When Chromium/cost spikes | Set `PDF_ENABLED=false` on the API. Generate returns 403. |
| Seed users | Staging only | `SEED_PASSWORD` required; seed refuses `NODE_ENV=production`. |
| Metrics scrape | Continuous | `GET /metrics` (Prometheus text). HTTP duration, TUS hook results, photo bytes, sync/photo lag histograms, `job_total` / `job_dead_letters` from SQL. |
| Dead-letter jobs | Daily glance | `SELECT type, count(*) FROM jobs WHERE status = 'dead' GROUP BY 1;` Alert if the `job_dead_letters` gauge grows. |
| TileServer GL (Flaha-owned pack) | Monthly extract rebuild | [tileserver-gl.md](./tileserver-gl.md). Devices only prefetch from our XYZ. Attribution © OpenStreetMap contributors. |

## SLIs (SQL)

Eventual photo ready rate (24h):

```sql
SELECT
  count(*) FILTER (WHERE ph.status = 'ready' AND ph.uploaded_at < ip.captured_at + interval '24 hours')
    * 1.0 / nullif(count(*), 0) AS ready_within_24h
FROM inspection_points ip
LEFT JOIN photos ph ON ph.inspection_point_id = ip.id
WHERE ip.deleted_at IS NULL
  AND ip.captured_at < now() - interval '24 hours';
```

Metadata lag (`created_at - captured_at`):

```sql
SELECT
  percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM created_at - captured_at)) AS p50_s,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY extract(epoch FROM created_at - captured_at)) AS p95_s
FROM inspection_points
WHERE deleted_at IS NULL;
```

## Alerts (pilot)

- Error rate > 5% on `/v1/inspection-points` or `/internal/tus`.
- `job_dead_letters` increasing day over day.
- MinIO disk > 80%; Postgres connections near `max_connections`.
- Storage cost: flip `UPLOADS_ENABLED=false`.

## e2e smoke

From a host that can reach compose:

```bash
SEED_PASSWORD=… node infra/e2e/pilot-smoke.mjs
```

Path: login → create point → TUS upload → list points → generate PDF until `ready`.
