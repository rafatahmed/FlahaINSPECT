> **Non-normative.** Exploratory system sketch only. Design of record: [`FlahaINSPECT - Technical Design (MVP).md`](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md). Ignore stack alternatives here (Firebase, Firestore, Supabase Auth, OAuth, client comments, GNSS, notifications). Product name is **FlahaINSPECT**.

**FlahaINSPECT System Schematics (Draft)**

Here is a clear, practical draft of the full system architecture based on everything we discussed: offline-first mobile capture, high-accuracy GPS (phone + optional external GNSS), resumable photo uploads (TUS), offline map tiles, categorized points (Defect / Normal / Note), report generation, and editable dashboard.

---

### 1. Overall System Architecture (High-Level Schematic)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FlahaINSPECT System                      │
└─────────────────────────────────────────────────────────────────┘

          ┌──────────────────────┐
          │   Field Inspectors   │
          │  (Mobile Devices)    │
          └──────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Mobile App          │
         │  (Offline-First)      │
         │  • Capture            │
         │  • GPS / External GNSS│
         │  • Photos + Category  │
         │  • Offline Maps       │
         │  • Local Queue        │
         └───────────┬───────────┘
                     │ (when online)
                     │ HTTPS + TUS
                     ▼
┌────────────────────────────────────────────────────────────┐
│                     Backend / API Layer                    │
│  Auth • Projects • Inspections • Photos • Reports • Sync   │
└───────┬──────────────────────────────────────────┬─────────┘
        │                                          │
        ▼                                          ▼
┌───────────────────┐                    ┌─────────────────────┐
│  Object Storage   │                    │  Database           │
│  (Photos + Tiles) │                    │  (Postgres + PostGIS│
│  S3 / MinIO /     │                    │   or Firebase)      │
│  Supabase Storage │                    │                     │
└───────────────────┘                    └─────────────────────┘
        │                                          │
        └──────────────────┬───────────────────────┘
                           ▼
                ┌──────────────────────┐
                │  Web Dashboard       │
                │  (Frontend)          │
                │  Managers / Clients  │
                │  • Map View          │
                │  • Edit Reports      │
                │  • Status / Remarks  │
                └──────────────────────┘
```

---

### 2. Mobile App Schematic (Detailed)

```
Mobile App Architecture (Flutter / React Native recommended)

┌──────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  Login • Project Select • Map View • Capture Screen          │
│  Category Buttons (Defect / Normal / Note) • Sync Status     │
│  Accuracy Indicator • External GNSS Status                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                     Business / Domain Layer                  │
│  Inspection Service • Photo Service • GPS Service            │
│  Sync Manager • Map Cache Manager • Auth Manager             │
└───────┬───────────────────┬───────────────────┬──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Local Database│   │ File System     │   │ Location Layer  │
│ (SQLite/Drift │   │ • Original photos│   │ • Phone GPS     │
│  / Isar /     │   │ • Compressed    │   │ • External GNSS │
│  Watermelon)  │   │ • Thumbnails    │   │   (NMEA / Mock) │
│               │   │ • Offline Tiles │   │ • Accuracy meta │
│ Outbox Queue  │   │                 │   │                 │
└───────┬───────┘   └────────┬────────┘   └────────┬────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Sync / Network │
                    │  • Connectivity │
                    │  • TUS Uploader │
                    │  • Delta Sync   │
                    │  • Background   │
                    │    Worker       │
                    └─────────────────┘
```

**Key Mobile Flows**
- Capture → Local DB + File + Outbox (instant, offline)
- GPS: Prefer external GNSS if available and more accurate → store accuracy + fix type
- Maps: Pre-cached project tiles + ambient cache + vector overlays (boundary + points)
- Sync: Metadata first → resumable TUS photo upload → mark synced

---

### 3. Server Backend Schematic

```
Backend Architecture

┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Auth                     │
│          JWT / OAuth • Role-based (Inspector/Manager/Client)│
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌────────────────┐    ┌─────────────────┐
│ Projects API  │    │ Inspections API│    │ Photos / Files  │
│ • CRUD        │    │ • Create/List  │    │ • TUS Endpoint  │
│ • Boundaries  │    │ • Categories   │    │ • Resumable     │
│ • Assignments │    │ • Status       │    │ • Completion    │
└───────┬───────┘    └───────┬────────┘    │   Hook          │
        │                    │             └────────┬────────┘
        │                    │                      │
        └────────────────────┼──────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services                            │
│  Report Generator • Map Service • Notification Service      │
│  Sync Orchestrator • Thumbnail / AI (future) Processor      │
└───────┬───────────────────────────────────────────┬─────────┘
        │                                           │
        ▼                                           ▼
┌───────────────────┐                     ┌─────────────────────┐
│ Database          │                     │ Object Storage      │
│ Postgres + PostGIS│                     │ (S3-compatible)     │
│ or Firestore      │                     │ Photos / Tiles /    │
│ • Users           │                     │ Report PDFs         │
│ • Projects        │                     │                     │
│ • InspectionPoints│                     │                     │
│ • Photo Metadata  │                     │                     │
│ • Audit Logs      │                     │                     │
└───────────────────┘                     └─────────────────────┘
```

**Important Backend Responsibilities**
- TUS server (tusd or Supabase resumable) with completion hook → link photo to inspection
- PostGIS (or equivalent) for spatial queries and map generation
- Report generation (PDF with embedded map + categorized photo grid)
- Delta sync endpoints for projects / previous points
- Role-based access control

---

### 4. Frontend / Web Dashboard Schematic

```
Web Dashboard (React / Next.js / Vue recommended)

┌──────────────────────────────────────────────────────────────┐
│                     Layout / Shell                           │
│  Sidebar • Header (User / Project Switcher) • Notifications  │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Dashboard Home│   │ Project Map View│   │ Report Editor   │
│ • Summary     │   │ • Interactive   │   │ • Photo List    │
│   Cards       │   │   Map (Leaflet/ │   │ • Category Tabs │
│ • Recent      │   │   Mapbox)       │   │ • Edit Remarks  │
│   Inspections │   │ • Color Markers │   │ • Procedures    │
│ • Open Defects│   │ • Filters       │   │ • Status        │
└───────────────┘   │ • Boundary      │   │ • Export PDF    │
                    └─────────────────┘   └─────────────────┘
                            │
                    ┌───────▼───────┐
                    │ Shared Components
                    │ • Map Component
                    │ • Photo Gallery
                    │ • Status Chips
                    │ • Form Editors
                    └───────────────┘
```

**Dashboard Core Features**
- Interactive map with project boundary + color-coded points (red = Defect, green = Normal, yellow = Note)
- Click point → photo + metadata + editable fields
- Filters by category, date, status, inspector
- Report generation & download
- Role views: Inspector (limited), Manager (full edit), Client (read + comments)

---

### 5. Recommended Tech Stack Summary

| Layer              | Recommendation                          | Notes |
|--------------------|-----------------------------------------|-------|
| Mobile             | Flutter (preferred) or React Native    | Excellent offline + camera + GPS |
| Local DB           | Drift / Isar (Flutter) or WatermelonDB | Outbox pattern |
| Photo Upload       | TUS protocol                           | Resumable |
| Maps (Mobile)      | flutter_map + FMTC or MapLibre         | Offline tiles |
| Backend            | Node.js / NestJS or Firebase + Cloud Functions | Or Supabase for speed |
| Database           | PostgreSQL + PostGIS                   | Spatial power |
| Storage            | S3 / MinIO / Supabase Storage          | TUS compatible |
| Frontend Dashboard | Next.js + React + Tailwind + Leaflet/Mapbox | Fast & modern |
| Auth               | JWT / Supabase Auth / Firebase Auth    | Role-based |

---

### 6. Main Data Entities (Simplified)

- **User** (role: inspector / manager / client)
- **Project** (name, boundary GeoJSON, assigned users)
- **InspectionPoint** (client UUID, lat/lon, accuracy, category, status, notes, remarks, procedure, timestamps, inspector)
- **Photo** (linked to point, original URL, thumbnail, EXIF metadata, upload status)
- **Report** (generated snapshot + editable fields)

---

This schematic is ready to hand to developers or to refine further.  

Would you like me to expand any part into more detailed component diagrams, sequence diagrams (e.g., capture → sync → report), database schema, or API endpoint list next?