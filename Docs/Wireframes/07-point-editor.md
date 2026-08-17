# 07 — Point editor (web)

**Release:** R1

```
┌ Photo + mini-map     ┬ Read-only field block                  ┐
│ (BFF thumb / full)   │ Category, captured_at, inspector,      │
│                      │ accuracy, coords, outside_boundary,    │
│                      │ note (plain text, not editable)        │
│                      ├ Manager edit                           │
│                      │ Remarks            [textarea 4000]     │
│                      │ Recommended proc.  [textarea 4000]     │
│                      │ Status             [select]            │
│                      │ [ Save ]  (sends version)              │
└──────────────────────┴────────────────────────────────────────┘
```

## Must have

- **Note is read-only.** Label it `Field note`.
- Editable: `remarks`, `recommended_procedure`, `status` only.
- Status values: `open | in_progress | resolved | closed`. Hide `acknowledged` in the UI (enum exists for later client flow).
- Optimistic concurrency: send `version`; on 409 show server values and require reload.
- Soft-delete (manager): confirm dialog → point disappears from default map/list, appears in delta `deleted_ids`.

## Must not have

- Editable notes / category / lat-lon.
- “Add photo”, comments, @mentions.
- Rich text / HTML.

## Photo missing

If photo not `ready`: placeholder `Photo still uploading` and disable nothing else — remarks can be edited.
