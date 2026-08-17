# 04 — Capture

**Release:** R1  
**Rule:** create-once. Pin and note are frozen at Save.

```
┌─────────────────────────────┐
│ ← Capture                   │
│                             │
│  [ live camera / preview ]  │
│                             │
│  GPS 4.2 m                  │
│  [ Adjust pin on map ]      │
│                             │
│  [ Defect ][ Normal ][ Note]│
│                             │
│  Additional notes (optional)│
│  [                      ]   │
│                             │
│  [ Save locally ]           │
└─────────────────────────────┘
```

## Must have

- Exactly **one** photo required (shutter or accept preview).
- Category required (one of three). Large buttons, high contrast.
- Note optional, plain text, max 4000.
- Accuracy always visible. If `accuracy_m > 10`: non-blocking banner `GPS is less precise than 10 m. You can still save, or adjust the pin.`
- **Adjust pin** opens a map, movable pin, Confirm. Sets `location_adjusted=true`. Only **before** Save.
- Save writes point + photo + two outbox rows in one transaction, then returns to map or list with toast `Saved locally — pending sync`.

## Must not have

- Save without photo or category.
- Compass required, voice note, severity, sub-types, second photo.
- Edit after Save.
- Upload progress on this screen (that is 05).

## Storage

- Warn if free &lt; 500 MB; **block** capture if &lt; 200 MB.
