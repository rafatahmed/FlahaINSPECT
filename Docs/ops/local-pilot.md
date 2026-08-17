# Local / internal pilot (v1.0.0)

Do **not** start web + Android Gradle + emulator at the same time on a tight disk. Order below. Docker Desktop must be **running** (engine healthy) before any `make up` / `tiles-*`.

Seed users (password = `SEED_PASSWORD` in `.env`):

| Role | Email |
|------|--------|
| Manager | `manager@local.flaha` |
| Inspector | `inspector@local.flaha` |

---

## 1. Data plane + Flaha tiles

From the repo root, with `.env` copied from `.env.example` and `SEED_PASSWORD` set (≥10 chars):

```powershell
# Start Docker Desktop first, wait until it is idle.
make up
make migrate-twice
make seed

make tiles-prepare    # Geofabrik Qatar PBF → qatar.mbtiles (once; several minutes)
make tiles-up         # TileServer GL on :8082
```

Confirm:

1. http://127.0.0.1:3001/health → `{"status":"ok",…}`
2. http://127.0.0.1:8082 → TileServer index. **Copy the style id** if it is not `basic-preview`.
3. Open a sample tile, e.g.  
   `http://127.0.0.1:8082/styles/basic-preview/12/2621/1697.png`  
   You should see a PNG, not HTML.

Optional `.env` (for humans; the **app** still needs `--dart-define`):

```text
TILE_PROVIDER_URL=http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png
TILE_PROVIDER_ATTRIBUTION=© OpenStreetMap contributors
```

---

## 2. Manager path (web)

```powershell
make web-dev
```

http://127.0.0.1:3000 — login as **manager**. Dashboard, point remarks, **Reports → Generate PDF**.

Leave web stopped if you are about to launch the emulator.

---

## 3. Inspector path (Android emulator)

```powershell
# AVD already created by make mobile-bootstrap-android
emulator -avd flaha_inspect_api35 -no-metrics
# wait until home screen is idle, then:
make mobile-run-android
```

That target now passes:

- API `http://10.0.2.2:3001`
- Tiles `http://10.0.2.2:8082/styles/basic-preview/{z}/{x}/{y}.png`

If the TileServer index used another style id:

```powershell
make mobile-run-android TILE_STYLE=osm-bright
```

Login as **inspector**. Open the seeded project → map.

- Streets should load from **Flaha** TileServer (attribution © OpenStreetMap contributors).
- **Download map** → progress → **Offline map ready**.
- Airplane mode / radio off → pack still shows; **Capture** still works.
- **Delete cache** removes the pack.

USB phone: use the PC LAN IP instead of `10.0.2.2` (same ports).

Windows desktop (no camera/GPS): `make mobile-run-windows` (uses `127.0.0.1`).

---

## 4. What “good” looks like

| Check | Pass |
|-------|------|
| Login inspector + manager | Seed password |
| Capture one Defect with GPS | Soft-warn only if &gt;10 m |
| Sync Now | Point + photo leave pending |
| Web map shows the point | Category color, not status |
| Generate PDF | Ready, download via BFF |
| Download map | Progress, then pack ready |
| Radio off + capture | Saves locally |

---

## 5. If something fails

| Symptom | Fix |
|---------|-----|
| `docker … npipe … dockerDesktopLinuxEngine` | Start **Docker Desktop**, wait, retry |
| TileServer 8082 empty / crash | `qatar.mbtiles` missing → re-run `make tiles-prepare` |
| App has no **Download map** | Rebuild with `make mobile-run-android` (dart-define). URL must not contain `openstreetmap.org` |
| Grey map on emulator | TileServer down, or style id wrong (`TILE_STYLE=…`) |
| Login hangs | API not up (`make up`); emulator must use `10.0.2.2` |
| System UI ANR | Do not run Gradle + emulator + Desktop update together |
