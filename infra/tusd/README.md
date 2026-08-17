# tusd (local)

tusd is started by `infra/docker-compose.yml`.

| Path | Where | Published? |
|------|--------|------------|
| Upload API `/files/` | `localhost:${TUSD_PORT}` (default 1080) | **Yes** — clients upload here |
| Hooks `pre-create` / `post-finish` | `http://api:3001/internal/tus` on the compose network | **No** — outbound from tusd, not a host port |

Hook auth (PR-02 stub; PR-07 adds membership / hash checks):

- URL query `secret=${TUSD_HOOK_SECRET}` (set in compose)
- Header `X-Tusd-Hook-Secret` also accepted

Incomplete objects live under prefix `uploads/` in the private `S3_BUCKET`. PR-07 finalizes into `photos/…`.
