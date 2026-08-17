# TileServer GL — Flaha Agri Tech owned tile service

**Status:** KD-43 / G-01 decided  
**Operator / service owner:** **Flaha Agri Tech**  
**Product:** FlahaINSPECT  
**Runtime:** `infra/docker-compose.yml` service `tiles` (profile `tiles`)  
**Image:** `maptiler/tileserver-gl:v4.15.3`  
**How to build the pack:** `infra/tiles/prepare-qatar.ps1`

This is the **only** tile source allowed for staging, pilot, and production prefetch (FMTC). Public `tile.openstreetmap.org` is **not** this service.

---

## 1. What “owned by Flaha Agri Tech” means

Flaha Agri Tech **owns and operates** the tile **service** and the **operational pack** devices talk to. Inspectors never download tiles from a third-party map SaaS and never bulk-scrape OSMF servers.

| Layer | Owner | What it is |
|-------|--------|------------|
| TileServer GL process, compose file, host, port **8082**, internal URL | **Flaha Agri Tech** | We start it, we stop it, we decide who may reach it. |
| `qatar.mbtiles` produced by `prepare-qatar.ps1` | **Flaha Agri Tech** (operational derived pack) | Our file on our disk. We choose refresh cadence and which devices get it. **Not committed to git.** |
| Style / XYZ URL we publish as `TILE_PROVIDER_URL` | **Flaha Agri Tech** | `http://<flaha-host>:8082/styles/<style>/{z}/{x}/{y}.png` |
| Offline copies on inspector phones (FMTC, after R2-13) | **Flaha Agri Tech** | Issued cache of *our* XYZ. Delete-cache is our control. |
| Project boundaries, inspection points, GPS, photos, PDFs | **Flaha Agri Tech** | Application data. Independent of tiles. |
| Street/building **geometry inside the extract** | **OpenStreetMap contributors** (ODbL) | We have the right to produce and **serve a derived database**. We do **not** claim copyright on OSM ways. Attribution is mandatory. |
| TileServer GL / Planetiler binaries | Their authors (BSD / Apache etc.) | Software we run, not data we own. |

**Say this to clients and legal:**

> Base-map **tiles for FlahaINSPECT** are served from a **Flaha Agri Tech** TileServer GL.  
> Devices prefetch only from that Flaha endpoint.  
> The street geometry in the Qatar pack is an OpenStreetMap-derived database (ODbL); Flaha attributes © OpenStreetMap contributors on every map.  
> Inspection evidence (photos, notes, GPS, reports) is Flaha Agri Tech data.

Do **not** write “Flaha owns OpenStreetMap.” That is false and unnecessary. Do write “Flaha owns the tile **service**, the **pack file**, and all **inspection data**.”

---

## 2. Why this closes G-01

| Requirement | How TileServer GL satisfies it |
|-------------|-------------------------------|
| Named source | Flaha Agri Tech TileServer GL (KD-43) |
| XYZ `{z}/{x}/{y}` | TileServer GL raster endpoint (flutter_map + FMTC) |
| Offline / bulk prefetch allowed | Yes — we serve **our** pack, not OSMF tiles |
| Attribution | Always `© OpenStreetMap contributors` |
| No public OSM bulk | `tile_policy.dart` refuses bulk when the URL is `openstreetmap.org` |
| Qatar coverage | Geofabrik `asia/qatar-latest.osm.pbf` → Planetiler |

---

## 3. Architecture

```
                    Flaha Agri Tech
                    ────────────────
 Geofabrik PBF  →  Planetiler  →  qatar.mbtiles  →  TileServer GL
 (ODbL extract)    (our build)    (our pack file)    (our process)
                                                         │
                         TILE_PROVIDER_URL (XYZ PNG)     │
                    ┌────────────────────────────────────┤
                    ▼                                    ▼
              flutter_map (online)              FMTC region download
              Web Leaflet (optional)            (R2-13, z12–17 + 300 m)
                    │
                    ▼
         Local overlays (Flaha-owned):
         project boundary, Defect/Normal/Note, GPS + accuracy
```

Data plane (compose network `flaha`):

| Host port | Process | Owner |
|-----------|---------|--------|
| 8082 | TileServer GL | Flaha Agri Tech |
| 3001 | Nest API | Flaha Agri Tech |
| 5433 | PostGIS | Flaha Agri Tech |
| 9000 | MinIO | Flaha Agri Tech |
| 1080 | tusd | Flaha Agri Tech |

Tiles are **not** stored in MinIO. Photos/PDFs are. Do not mix prefixes.

---

## 4. Data pipeline (how the pack is born)

All steps run **on Flaha hardware** (dev machine or staging VM). Output stays on Flaha disk.

1. **Download** Geofabrik Qatar PBF  
   `https://download.geofabrik.de/asia/qatar-latest.osm.pbf`  
   ~50 MB. This is OSM **data**, not OSM **tiles**.
2. **Build** `infra/tiles/data/qatar.mbtiles` with Planetiler  
   `pwsh -File infra/tiles/prepare-qatar.ps1`  
   or `make tiles-prepare`.
3. **Serve** (read-only mount)  
   `make tiles-up`  
   Compose profile `tiles` → `maptiler/tileserver-gl:v4.15.3`  
   Volume: `infra/tiles/data:/data:ro`
4. **Publish URL** (Flaha-controlled host)  
   Local: `http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png`  
   Android emulator: `http://10.0.2.2:8082/styles/basic-preview/{z}/{x}/{y}.png`  
   Staging/pilot: same container behind an **internal** Flaha hostname.
5. **Confirm style id** on http://127.0.0.1:8082 (index). If the style is not `basic-preview`, put the real id in `TILE_PROVIDER_URL`.

`qatar.mbtiles` and `*.osm.pbf` are **gitignored**. They are Flaha operational artifacts, not source.

Refresh: re-run `prepare-qatar.ps1` when OSM in Qatar has changed enough to matter (monthly is enough for landscape sites). Restart `tiles`. FMTC caches on devices need an explicit re-download (R2-13).

---

## 5. Runtime contract

```yaml
# infra/docker-compose.yml — service tiles
profiles: [tiles]          # default `make up` does not start it
image: maptiler/tileserver-gl:v4.15.3
ports: ["${TILE_PORT:-8082}:8080"]
volumes: ["./tiles/data:/data:ro"]
```

| Env | Role |
|-----|------|
| `TILE_PORT` | Host port (default 8082) |
| `TILE_PROVIDER_URL` | Full XYZ template devices use |
| `TILE_PROVIDER_ATTRIBUTION` | `© OpenStreetMap contributors` |
| `TILE_PROVIDER_USER_AGENT` | `FlahaINSPECT/1.0` |

Empty `TILE_PROVIDER_URL` = local **debug only** (ambient public OSM, **no** bulk). Pilot/staging **must** set the Flaha TileServer URL.

---

## 6. What appears on the map (ownership)

| Drawn on screen | Source | Owner |
|-----------------|--------|--------|
| Raster streets / landcover | TileServer GL PNG | **Service:** Flaha. **Geometry:** OSM (ODbL) |
| Project polygon | PostGIS `projects.boundary` | **Flaha Agri Tech** |
| Defect / Normal / Note pins | `inspection_points` | **Flaha Agri Tech** |
| Inspector location + accuracy circle | Device GPS | **Flaha Agri Tech** (field capture) |
| Photo thumbs | MinIO via BFF | **Flaha Agri Tech** |

If TileServer is down: grey canvas + Flaha overlays still work. Capture still works (wireframe 03).

---

## 7. Security and access

- TileServer is **Flaha infrastructure**. Do not publish 8082 to the public internet without auth / VPN / private network.
- No API key in the tile URL for the first internal pilot (the network *is* the control). Add a reverse-proxy key if the host is reachable outside Flaha.
- Do not put tile keys in Drift (KD-37).
- Do not let FMTC target any host except `TILE_PROVIDER_URL`.
- Read-only mount of `/data` so the container cannot rewrite the pack.

---

## 8. Attribution (non-negotiable)

Every FlahaINSPECT map surface (mobile, later web if it uses these tiles) shows:

```text
© OpenStreetMap contributors
```

That is how we stay legal while **owning the service**. Wireframe 03: attribution always visible.

---

## 9. Ops checklist (tiles)

| Item | Cadence | Owner |
|------|---------|--------|
| Rebuild `qatar.mbtiles` | Monthly or after a large OSM edit on a live site | Platform |
| Disk for pack + FMTC | Check before download; same 200 MB capture gate | Mobile / platform |
| Attribution still on | Every release | Mobile |
| Staging URL still Flaha TileServer, not OSMF | Every release | Platform |
| Backup of `qatar.mbtiles` | With VM / disk backup | Ops |

---

## 10. Related files

| Path | Role |
|------|------|
| `infra/docker-compose.yml` (`tiles`) | Flaha-owned process |
| `infra/tiles/prepare-qatar.ps1` | Builds Flaha pack |
| `infra/tiles/data/` | Pack directory (gitignored binaries) |
| `apps/mobile/lib/map/tile_policy.dart` | Bulk allowed only for non-OSMF URLs |
| [G-01-tile-source.md](../G-01-tile-source.md) | Decision record |
| [pilot-checklist.md](./pilot-checklist.md) | Broader ops |
