# 02 — Project list (mobile home)

**Release:** R1

```
┌─────────────────────────────┐
│ FlahaINSPECT          [☰]   │
│ Offline · GPS 4 m           │
│                             │
│ Assigned projects           │
│ ┌─────────────────────────┐ │
│ │ West Bay landscape      │ │
│ │ 12 points · 3 pending   │ │
│ │ Map: online             │ │
│ │ [ Open ]                │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Al Khor farm   ARCHIVED │ │
│ │ (read only)             │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Must have

- List **assigned** projects only (inspector). Managers on mobile see all non-deleted if they use the app.
- Per row: name, last capture or point count if known, pending outbox count, archived flag.
- Offline indicator in chrome (connectivity, not GPS).
- Current GPS accuracy in chrome when permission granted (informational).
- Open → map (03) for that project.
- Archived: visible, **cannot** start capture.

## Must not have

- Floating `+` to create a project (manager-only, and only on web).
- Search required in R1 (nice if cheap; not exit criterion).
- Fake avatars or “last inspection +30 pm” decoration.

## Empty / error

- No projects: `You have no assigned projects. Ask a manager.`
- Auth expired: return to login.
