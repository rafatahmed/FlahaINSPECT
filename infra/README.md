# Infra (PR-02)

Local data plane: **PostgreSQL 16 + PostGIS 3.5**, **private MinIO**, **tusd**, **api**, **worker**.

No Redis. tusd hook traffic stays on the compose network.

```bash
cp .env.example .env
make up          # docker compose up -d --build
make ps
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3001/health/ready
make down
```

| Host port | Service |
|-----------|---------|
| 5433 | Postgres (5433 on the host so a local Postgres on 5432 is left alone) |
| 9000 | MinIO S3 API (private bucket; use credentials / signed URLs) |
| 9001 | MinIO console (local only) |
| 1080 | tusd uploads `/files/` |
| 3001 | Nest API |

Hook endpoints are **not** mapped to extra host ports.
