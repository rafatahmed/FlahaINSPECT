# 06 — Manager dashboard (web)

**Release:** R1

```
┌ Sidebar ────────┬ Header: project switcher · user ────────────┐
│ Dashboard       │ Cards: points today | open defects | pending photos │
│ Projects        │                                                     │
│ Users           │  Leaflet map: boundary + category markers           │
│ Reports (R2)    │  Filters: category · status · date · inspector      │
│                 │  List: time · category · status · inspector         │
└─────────────────┴─────────────────────────────────────────────────────┘
```

## Must have

- Project switcher (all non-deleted projects for manager).
- Summary cards from `GET /projects/:id/stats` (real counts, not decorative).
- Map legend = **Defect / Normal / Note** (category colors). Status is a list column + filter, not the pin color.
- Click pin or row → 07 point editor.
- Auth: cookie BFF; no tokens in `localStorage`.
- Images via `/bff/photos/:id/thumb`.

## Must not have

- Client comments, notifications inbox, “Urgent” pin color, 12k fake KPIs.
- Inspector-facing capture on web in R1.
- Export PDF in R1 (card can exist disabled until R2).

## Projects / Users (R1, same shell)

- Projects: create, archive, soft-delete, boundary draw or GeoJSON paste, assign members (user picker). No per-project role picker — assignment only (KD-33).
- Users: create inspector, set password, activate/deactivate, change role (bumps `token_version`).
