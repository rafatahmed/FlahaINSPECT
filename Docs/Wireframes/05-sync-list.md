# 05 — Inspection list / sync status

**Release:** R1

```
┌─────────────────────────────┐
│ ← West Bay                  │
│ Pending: 3     [ Sync now ] │
│ ☐ Wi-Fi only                │
│ Last sync: 12:04            │
│                             │
│ ┌─ Defect ── pending ─────┐ │
│ │ thumb  leak at valve 3  │ │
│ │ 10:12 · 4.2 m · photo 40%│ │
│ └─────────────────────────┘ │
│ ┌─ Normal ── synced ──────┐ │
│ │ thumb  hedge OK         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Must have

- Queue count, last successful sync time, per-item status: `pending | syncing | synced | failed`.
- Photo progress % while `UploadPhoto` in progress.
- **Sync now** (supported path if the app was killed — R1 does not rely on iOS background).
- Wi-Fi only toggle.
- Filters: category, date (optional).
- Failed item: last error + Retry (re-queues outbox). `PROJECT_ARCHIVED` is not retryable.
- Status icons must match the **same** row’s category (no mixed Defect title + Normal chip).

## Must not have

- Swipe-to-edit category or note.
- Delete of a pending point in R1 (out of scope; avoid orphan photos).

## Supported sync path (R1 DoD)

Inspector leaves the list open (or taps Sync now) while connected. Background OS upload is **not** an R1 exit criterion (G-11).
