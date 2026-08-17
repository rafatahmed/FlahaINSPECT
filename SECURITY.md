# Security Policy

## Supported versions

FlahaINSPECT is under active design and early development. Security fixes apply to the default branch (`main`) and any tagged release once shipping begins.

## Reporting a vulnerability

**Do not** open a public GitHub issue for security-sensitive findings (auth bypass, data exposure, injection, secret leakage, insecure photo/object storage access, etc.).

Please report privately. **Do not** file a public GitHub issue.

1. Email **eng.rafatahmed@hotmail.com** (repository owner / Flaha engineering). Use the subject line `FlahaINSPECT security`.
2. Include:
   - Description and impact
   - Reproduction steps or proof-of-concept (non-destructive)
   - Affected component (`api`, `web`, `mobile`, `infra`, docs if relevant)
   - Suggested remediation if known

We aim to acknowledge reports within a few business days and will coordinate disclosure after a fix is available.

## Handling secrets in this repository

- Never commit real `.env` files, API keys, JWT signing secrets, database passwords, cloud credentials, or mobile signing keystores.
- Use `.env.example` (committed) with placeholder values only.
- Rotate any credential that may have been committed; treat history as compromised until scrubbed.
- Prefer short-lived tokens and least-privilege IAM for object storage and CI.

## Data sensitivity

Inspection photos, GPS coordinates, project boundaries, and client site details are **confidential operational data**. Design and implement access control (roles: inspector / manager), private object storage, and secure transport (HTTPS/TLS) as first-class requirements—not afterthoughts.
