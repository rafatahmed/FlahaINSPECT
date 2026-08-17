# Self-hosted tiles (G-01 / KD-43)

Pilot/prod base map is **our** TileServer GL, not `tile.openstreetmap.org`.

Data: **Qatar extract** from Geofabrik (ODbL) → Planetiler MBTiles → raster XYZ.

## Prepare the pack (once)

Needs Docker. Downloads ~50 MB OSM PBF, then builds `data/qatar.mbtiles` (do not commit it).

```powershell
pwsh -File infra/tiles/prepare-qatar.ps1
```

## Serve

```bash
# from repo root, with .env
docker compose -f infra/docker-compose.yml --env-file .env --profile tiles up -d tiles
```

Or `make tiles-up` after `make tiles-prepare`.

Open http://127.0.0.1:8082 and copy the style id from the index (often `basic-preview`).

```text
TILE_PROVIDER_URL=http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png
TILE_PROVIDER_ATTRIBUTION=© OpenStreetMap contributors
```

Android emulator: `http://10.0.2.2:8082/styles/basic-preview/{z}/{x}/{y}.png`.

## Rules

- Attribution always on (ODbL).
- Do **not** point FMTC at public OSM.
- Staging/pilot: same image + the same `qatar.mbtiles` (or a newer extract) behind an internal URL.
