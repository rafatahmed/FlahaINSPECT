# G-01 — Tile source for staging / pilot / production

**Status:** `open` (decision brief, not a decision)  
**Owner:** Platform (Rafat) + whoever signs the invoice / license  
**Unblocks:** R2-13 FMTC offline pack, R2 exit criterion 3, O-8  
**Does not unblock:** anything else in R2 (reports, metrics, AR keys are already merged)

This file frames the **only remaining R2 hard external blocker**. It does not pick a vendor. Closing G-01 is a one-paragraph decision plus the filled **closure form** at the bottom, then a changelog line and a `GAPS.md` status flip.

Design of record: [Technical Design (MVP)](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md) Maps Design + KD-9 + KD-35.  
Policy already locked: [GAPS.md](./GAPS.md) R0-05 / KD-35.  
UX of record: [Wireframes/03-map.md](./Wireframes/03-map.md).  
Code already in tree: `apps/mobile/lib/map/tile_policy.dart` (`TILE_PROVIDER_URL` gate).

---

## 1. What is already locked (do not reopen)

| Lock | Meaning |
|------|---------|
| **KD-9** | Mobile map is **flutter_map + FMTC**. Not Mapbox SDK. Not MapLibre unless we later write a scope change. |
| **KD-35** | **local/dev:** public OSM raster is allowed for *ambient* browsing only. **staging / pilot / production:** contracted commercial tiles **or** a self-hosted pack. |
| **OSM tile ToS** | `tile.openstreetmap.org` **forbids bulk download and offline prefetch**. Ambient cache of tiles an engineer already viewed is the only OSM use we allow. |
| **R1 map** | Online (or last ambient cache). Grey canvas + local markers if tiles are missing. Capture still works. Already shipped. |
| **R2 map** | Explicit “Download map for this project”, progress, delete cache. **Only** against a licensed `TILE_PROVIDER_URL`. |
| **Pre-cache shape** | Project `boundary` or `bbox` + **300 m** buffer, zoom **12–17**. Typical pack **20–80 MB** for a 5–50 ha site. |
| **Overlays** | Boundary, category markers, you + accuracy circle — all **local**. They do not depend on the tile vendor. |
| **Attribution** | Always visible. User-Agent `FlahaINSPECT/1.0` (or the vendor’s required UA). |
| **Secrets** | API keys are **not** stored in Drift (KD-37). Compile-time / env / secure storage only. |

R1-13 already merged the **policy gate**. Setting `TILE_PROVIDER_URL` to a public OSM URL **does not** allow bulk download (`usesPublicOsm` ⇒ `allowBulkDownload = false`).

---

## 2. What G-01 actually decides

One **named source** that we are allowed to **prefetch** onto a field device.

Not decided yet:

1. **Who serves the tiles** (vendor account vs our own host).
2. **What the inspector sees** (streets / satellite / hybrid).
3. **The exact URL template** that goes in `TILE_PROVIDER_URL`.
4. **Written permission** that **offline / bulk region download** is in the contract (most “maps API” plans are *online view only*).
5. **Attribution string** and any key / referrer rules.
6. **Who pays** and which env (staging = same source as pilot, or a cheaper twin).

When those six are filled, G-01 is `decided`. R2-13 can then implement FMTC against that URL.

---

## 3. Why this matters in Qatar, for Flaha

Inspectors work **landscape / farm / irrigation / softscape** sites, often **without radio**. They need:

- the **project boundary**
- **their GPS** + accuracy
- **Defect / Normal / Note** pins (already local)
- enough **base map** to walk to the next plant / valve / path

Typical project is **5–50 ha**. Zoom 12–17 is “district → planting bed”, not a country extract.

**Streets-only (OSM-derived)** is enough to navigate the site and read the boundary. It is **weak** inside a farm (beds, irrigation laterals, turf edges often do not exist as OSM ways).

**Satellite / hybrid** is what actually shows “that palm, that drip line”. It is also where **license and money** live. Satellite is almost never free to prefetch.

Pilot size is **1–2 internal projects**, **10–30 inspectors** max. Do not buy a world-wide enterprise map seat for that.

---

## 4. Options (the real choice)

All options must speak **XYZ raster** `{z}/{x}/{y}` (or a thin raster wrapper) because the locked stack is flutter_map + FMTC. Vector-only SDKs (Mapbox GL, MapLibre native) are a **stack change**, not a G-01 fill-in.

### Option A — Commercial XYZ, streets (fastest close)

Examples in this class: **MapTiler Cloud**, **Stadia Maps**, **Thunderforest**.  
You create an account, get a key, set:

```text
TILE_PROVIDER_URL=https://…/{z}/{x}/{y}.png?key=…
TILE_PROVIDER_ATTRIBUTION=© OpenStreetMap contributors, © <vendor>
```

| | |
|--|--|
| **Unblocks R2-13** | Same week, if the plan text says **offline / export / on-device cache** is allowed. |
| **Cost (order of magnitude)** | Low tens to low hundreds USD / month at pilot traffic. Confirm the **offline** SKU; the $25 “Flex” style plans are often **online sessions only**. |
| **Fit for farms** | Adequate for roads + compound. Weak for beds / turf. |
| **Risk** | Signing a plan that allows *views* but **forbids prefetch**. That would look like G-01 is closed and then fail legal review. |
| **Do this if** | You want R2-13 unblocked now and accept streets as the first pack. |

**Hard requirement:** a sentence in the order form / ToS / email from sales: *mobile offline region download for our own inspectors is permitted*. Screenshot it into this folder or the ops vault.

### Option B — Commercial satellite or hybrid

Examples: MapTiler Satellite, Mapbox Satellite (only as **XYZ if offered**, not the Mapbox SDK), Esri World Imagery (ToS is usually **no bulk cache**).

| | |
|--|--|
| **Field value** | Highest. This is the map inspectors actually want on a farm. |
| **Cost / ToS** | Highest. Offline satellite is a **sales conversation**, not a self-serve checkbox. |
| **Do this if** | The first pilot site is vegetation-heavy and streets would be a grey maze. |

Do **not** scrape Esri / Google / Bing “for the pilot”. That is the same class of ToS failure as public OSM bulk.

### Option C — Self-host raster for Qatar (best long-term control)

Serve **our** tiles from compose / a small VM. Data is a **Qatar extract** (the country is small):

- **Streets:** OpenMapTiles / Planetiler → MBTiles or PMTiles → `tileserver-gl` or `martin`, expose XYZ.
- **One-project pack:** render only the pilot bbox + 300 m, ship as MBTiles; FMTC can ingest or we proxy XYZ from it.
- **Satellite:** you **buy** imagery (or a national dataset). OSM will not give you satellite.

| | |
|--|--|
| **Unblocks R2-13** | After one ops weekend: image, URL, attribution. |
| **Cost** | Compute is cheap. Streets data is cheap / free (ODbL attribution). Satellite data is the bill. |
| **Fit** | Matches KD-35 “self-hosted tile pack”. No per-inspector SaaS meter. |
| **Risk** | We own freshness, disk, and the User-Agent / attribution on the *data* (ODbL), not just the renderer. |
| **Do this if** | You do not want a vendor relationship, or you already know satellite will come from a purchased GeoTIFF later. |

This is **not** “run a public OSM scraper in MinIO”. That is still KD-35 violation.

### Option D — Defer offline packs (reject for “R2 done”)

Keep ambient-only maps. Capture already works with radio off (markers + grey canvas).

| | |
|--|--|
| **Honest status** | R2 exit criterion 3 and O-8 stay **open**. You can still run an **online** internal pilot. |
| **Do this if** | You explicitly re-scope R2 in ROADMAP + CHANGELOG. Do not quietly skip it. |

---

## 5. Recommended path (not a decision)

**Close G-01 on Option A (streets, written offline clause) for the first internal project**, implement R2-13, measure pack size on a real 10–20 ha site.

**In parallel, price Option B or C satellite** only for the one site that actually needs it. Do not block R2-13 on satellite procurement.

If no vendor will put “offline prefetch” in writing within a week, **fall to Option C streets** (Qatar extract). That is still a valid G-01 close.

Do **not** set `TILE_PROVIDER_URL` to `https://tile.openstreetmap.org/{z}/{x}/{y}.png` and call G-01 done. The gate will refuse bulk; a device build that ignored the gate would violate OSMF tile policy.

---

## 6. What R2-13 implements after G-01 is decided

Nothing in this list is G-01. Do not start it until the closure form is filled.

1. Add FMTC store; region download = project polygon/bbox + 300 m, z12–17.
2. Project screen: **Download map** / progress / **Delete cache** (wireframe 03).
3. Refuse download when `allowBulkDownload == false` (public OSM or empty URL).
4. Offline: last pack if present, else grey canvas + local markers + “Map tiles unavailable offline”. Capture stays enabled.
5. Attribution always on.
6. Document pack size on one real project in CHANGELOG (O-8).

Estimated pack: **20–80 MB** streets z12–17 for 5–50 ha. Satellite at z17 is larger; cap and warn if free disk &lt; 200 MB (same storage gate as capture).

---

## 7. Closure form (fill this to flip G-01 → `decided`)

Copy into the PR that marks G-01 decided (or into `.env.example` comments + this section).

```text
Provider name:
Style (streets / satellite / hybrid):
TILE_PROVIDER_URL (template, no secrets in git if the key is live):
TILE_PROVIDER_ATTRIBUTION:
TILE_PROVIDER_USER_AGENT (default FlahaINSPECT/1.0 unless vendor requires otherwise):
Written offline/bulk permission (link, ticket, or quote):
Zoom allowed (must include 12–17):
Staging and pilot use the same source? (yes/no + exception):
Who pays / account owner:
Review date:
```

Then, same commit:

1. GAPS G-01 → `decided` (one-paragraph what / why / what it unblocks).
2. TDD: add **KD-43** (or next free KD) with the vendor name + URL pattern.
3. CHANGELOG `[Unreleased]`.
4. ROADMAP: R2-13 `not-started` → ready to implement (deps still G-01 decided).

---

## 8. Out of scope for G-01

- Picking MapLibre / Mapbox SDK (that is a KD-9 change).
- National Qatar GIS portals unless they publish a **documented XYZ** we may cache.
- Path tracks, heatmaps, 3D, live traffic.
- Shipping a pilot APK pointed at public OSM “just to demo offline”.
