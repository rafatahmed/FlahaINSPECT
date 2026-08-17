# 03 — Live map (mobile)

**Release:** R1 online map; R2 offline pack (PR-13, after G-01).

```
┌─────────────────────────────┐
│ ← West Bay     Offline/Sync │
│                             │
│   [boundary polygon]        │
│   ● you + accuracy circle   │
│   ⬤ defect  ⬤ normal  ⬤ note│
│                             │
│  Accuracy 4.2 m             │
│  [ Filter: All ▾ ]  [ 📷 ]  │
└─────────────────────────────┘
```

## Must have

- Project boundary if present; user location + accuracy circle.
- Markers colored by **category** (Defect / Normal / Note), not by status.
- Tap marker → sheet: thumb (local if own pending, else placeholder), category, time, note preview. No field edit.
- Camera / Capture button → 04 (disabled if project archived or free storage &lt; 200 MB).
- Filter chips: All / Defect / Normal / Note.
- Attribution for the tile source, always visible.

## Must not have

- “External GNSS” badge or compass as a required control.
- Path / track line.
- Status-colored legend (Completed / Urgent).
- Bulk OSM download on staging/prod builds.

## Offline (R1 vs R2)

- **R1:** if tiles missing, show last cached tiles if any, else a non-blank fallback (grey canvas + local markers + “Map tiles unavailable offline”). Capture still works.
- **R2:** explicit “Download map for this project” on project screen; progress; delete cache. Licensed `TILE_PROVIDER_URL` only.
