> **Non-normative.** Exploratory map-cache notes only. Design of record: [`FlahaINSPECT - Technical Design (MVP).md`](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md). Locked: flutter_map + FMTC; **production/pilot field tiles require a contracted or self-hosted source (KD-35)** — do not bulk-scrape OSM in production. Path tracking overlays are out of MVP. Product name is **FlahaINSPECT**.

**Offline map tile caching is essential for FlahaINSPECT.** Inspectors need to see the project boundary, their live GPS position, previously captured points (color-coded Defect/Normal/Note), and the inspection path even when there is no signal on a remote farm or landscape site in Qatar.

Map tiles are small square images (or vector data) served at different zoom levels. Without caching, the map goes blank offline. Proper caching makes the map fully usable while keeping storage and data usage under control.

### How Tile Caching Works
- **Raster tiles** (PNG/JPEG): Simple images. Easy to cache but larger and less flexible (common with basic OSM or satellite).
- **Vector tiles**: Compact data that the app styles on-device. Much smaller storage and better performance (Mapbox, MapLibre, many modern providers).
- Tiles are identified by z/x/y (zoom, column, row). Storage grows roughly 4× per zoom level increase.
- Caching can be:
  - **Ambient/browse**: Automatically save tiles the user views.
  - **Bulk/pre-download**: Download a defined region (project boundary + buffer) ahead of time.
  - **Packaged (MBTiles)**: Single-file archives that can be generated server-side or downloaded.

### Recommended Strategies for FlahaINSPECT

**1. Project-based pre-caching (primary strategy)**  
When a user selects or downloads a project (while on good Wi-Fi/cellular):
- Take the project boundary (polygon or bounding box) + reasonable buffer (e.g., 200–500 m).
- Define zoom range suited to landscape/farm work: typically min zoom 11–13 (overview) to max zoom 16–18 (detailed plant/irrigation inspection). Higher zooms explode storage.
- Download the required tiles in the background with progress UI.
- Store per-project so users can manage (“Download map for this project”, “Delete offline map”).

This guarantees the exact area needed is available offline.

**2. Ambient + fallback caching (supporting)**  
While online, cache tiles the user pans/zooms. When offline:
- Serve from cache first.
- If a high-zoom tile is missing, fall back to a lower-zoom tile and scale it (common in MapLibre/react-native-maps offline mode).
- This covers unexpected areas or partial downloads.

**3. Hybrid with overlays**  
Base map tiles (cached) + your own vector overlays that are always local:
- Project boundary polygon.
- Inspection points (markers with photo thumbnails or category icons).
- GPS track of the current round.
- User location.

Overlays come from your local SQLite database (already part of the offline-first design) and do not depend on tile servers.

**4. Optional advanced: MBTiles or server-generated packs**  
For large or frequently visited sites, generate MBTiles on the server (or use tools like TileServer-GL) and let the app download one file per project. Very reliable and efficient for controlled environments.

### Storage Reality Check
Storage depends heavily on area size, zoom range, and style:
- Simple vector streets for a few km² farm at zooms 12–16: often tens of MB.
- Satellite or detailed hybrid imagery: can reach hundreds of MB for the same area.
- Urban dense areas cost more than open desert/farmland.

Always:
- Estimate and show expected size before download.
- Enforce per-project or global cache limits.
- Prefer Wi-Fi.
- Allow users to delete individual project caches.
- Monitor free device storage and warn before large downloads.

Mapbox has optimized offline tile packs that can reduce size significantly (up to ~40% in recent versions). Vector styles are strongly preferred over pure raster for mobile.

### Implementation Options by Stack

**Flutter (strong ecosystem)**  
- `flutter_map` + built-in caching (v8.2+) or plugins: `flutter_map_tile_caching` (FMTC – excellent bulk download of rectangles, circles, polygons, lines; multi-store; recoverable downloads), `flutter_map_cache`, or `offline_tiles` (MBTiles-focused).  
- Mapbox Maps Flutter SDK or MapLibre GL Flutter: native-style OfflineManager / region downloads with progress callbacks.  
- Best balance for custom agri maps: flutter_map + FMTC for full control, or MapLibre for polished vector offline.

**React Native**  
- MapLibre React Native OfflineManager (createPack with bounds, min/max zoom, progress).  
- react-native-maps with `tileCachePath` + `offlineMode` (caches and falls back to scaled lower zooms).  
- Mapbox RN SDK offline regions.

**Native or other**  
Mapbox, MapLibre, or ArcGIS SDKs all provide mature OfflineRegion / TileStore APIs with progress, invalidation, and size management.

**Common pattern**  
```text
Project selected / “Prepare offline”
  → Calculate bounds + buffer from project geometry
  → Start region download (Wi-Fi preferred)
  → Show progress + estimated remaining
  → On complete: mark project “map ready offline”
  → Map tile provider: local cache / MBTiles first → network only if online
```

### Best Practices & Pitfalls
- **Respect provider terms**: OSM requires proper User-Agent, attribution, and discourages heavy bulk scraping. Commercial providers (Mapbox, etc.) have explicit offline quotas and redistribution rules. Never redistribute downloaded tiles.
- **Zoom discipline**: Cap max zoom. For plant-level detail you rarely need >17–18.
- **Expiry & updates**: Tiles can become stale. Support “Refresh offline map” (re-validate or re-download changed tiles) and show last-updated date.
- **Battery & network**: Large downloads are heavy. Run in background with constraints, pause on low battery, prefer unmetered networks.
- **UX**: Clear indicators (“Offline map available”, “Downloading 45%”, “Using cached tiles”). Never leave the user with a blank map.
- **Integration with your offline sync**: Treat map packs like another queued asset. Download when the project metadata is pulled, or as a separate high-priority action.
- **Satellite vs streets**: For Flaha landscape/plant inspection, hybrid or satellite base layers are more useful than pure road maps. Test visual clarity for irrigation lines, plant health, etc.
- **Testing**: Simulate airplane mode after downloading a real project boundary. Verify markers, boundaries, and location still render.

### Practical Recommendation for FlahaINSPECT
Start with **project-boundary bulk download + ambient caching + local vector overlays**.  
Use a library that supports defined regions with progress (MapLibre OfflineManager, FMTC, or Mapbox). Prefer vector tiles for storage efficiency. Make offline map preparation an explicit step when the inspector selects a project (or auto-trigger on Wi-Fi after project assignment).

This pairs cleanly with the offline-first data/photo sync already discussed: the map becomes just another reliably available local resource.

If you tell me the preferred map library/stack (Flutter + flutter_map, Mapbox, MapLibre, Google, etc.) or typical project size (hectares), I can give more precise size estimates, code-level patterns, or schema suggestions for storing offline regions.