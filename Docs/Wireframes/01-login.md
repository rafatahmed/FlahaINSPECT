# 01 — Login

**Apps:** Mobile (Flutter), Web (Next.js, same fields).  
**Release:** R1

```
┌─────────────────────────────┐
│         FlahaINSPECT        │
│                             │
│  Email                      │
│  [                      ]   │
│                             │
│  Password                   │
│  [                      ]   │
│                             │
│  [        Log in        ]   │
│                             │
│  (no other links)           │
└─────────────────────────────┘
```

## Must have

- Email + password only.
- Submit disabled while request in flight.
- Errors: invalid credentials (same copy whether email exists or not), `ACCOUNT_LOCKED` (“Try again in 15 minutes”), `min_app_version` (mobile: blocking dialog with store/MDM message).
- After success: mobile → project list; web → dashboard.

## Must not have (R1/R2)

- Forgot password / reset / magic link.
- Language toggle (English only; AR keys come in PR-17 as unused resources).
- SSO, “remember me” checkbox (OS password manager is enough).
- Client / inspector / manager picker — role comes from the server.

## Copy

- Product wordmark: **FlahaINSPECT** (never FlahaINSPCT).
- Button: `Log in`.
- Generic fail: `Email or password is incorrect.`
