**Resumable photo uploads are critical for FlahaINSPCT.** High-resolution inspection photos (often 5–15+ MB) will frequently fail or interrupt on remote farm/landscape sites with flaky connectivity. Restarting from byte 0 wastes time, battery, and data. A proper resumable system lets the upload continue exactly from the last confirmed offset.

### Recommended Protocol: TUS (tus.io)
TUS is an open HTTP-based protocol specifically designed for resumable uploads. It is the strongest fit here:

- Client creates an upload (POST) → receives a unique upload URL.
- Data is sent with PATCH requests.
- To resume: HEAD request returns `Upload-Offset`; client continues from that byte.
- Supports metadata, checksums, expiration, and creation extensions.
- Mature clients exist for Flutter, React Native, iOS, Android, and web.
- Servers: official `tusd`, Supabase Storage (native TUS support), or custom implementations that can forward to S3/MinIO/etc.

S3 Multipart Upload is a solid alternative (especially for parallel parts) but requires more custom state management on pure mobile. TUS is simpler and more consistent across platforms for this use case.

### End-to-End Flow for FlahaINSPCT
1. **Photo capture (offline-capable)**  
   Save original (or high-quality) file to app-controlled storage.  
   Compute SHA-256 hash + file size.  
   Create inspection record in local SQLite with client UUID, GPS, category, etc.  
   Enqueue an upload task in the durable outbox (linked to the inspection UUID).

2. **Upload initiation** (when connectivity appears)  
   TUS client creates the upload on the server, sending metadata:  
   `inspection_id` (client UUID), `project_id`, `filename`, `contentType`, `hash`, device info, etc.

3. **Chunked transfer**  
   Upload in configurable chunks (recommended 1–5 MB for mobile).  
   Persist the upload URL + current offset locally after every successful chunk.

4. **Interruption / app kill**  
   On next launch or connectivity restore, the client reads the stored session, does a HEAD to confirm the server offset, and resumes.

5. **Completion**  
   Server (or completion hook) finalizes the file, moves it to permanent storage, generates thumbnails if needed, and links it to the inspection record.  
   Client marks the outbox task as synced and can optionally delete the local original (or keep a compressed version).

6. **Linking**  
   Prefer uploading the photo first (or in parallel with metadata). Once the final URL is known, update the inspection record with the photo URL(s).

### Client Implementation Outline

**Flutter (recommended cross-platform choice)**  
Popular packages: `tusc`, `tus_client` / forks, or higher-level engines such as `transfer_manager` (supports TUS with persistence).

Typical pattern:
```dart
// After capture – store task in local DB/outbox
final file = XFile(localPhotoPath);
final clientUuid = uuid.v4();
final hash = await computeSha256(file);

// Later, in sync worker
final tusClient = TusClient(
  file,
  store: TusFileStore(...), // persistent across app restarts
  maxChunkSize: 2 * 1024 * 1024, // 2 MB
);

await tusClient.upload(
  uri: Uri.parse('https://your-api.example.com/files/'), // or Supabase TUS endpoint
  headers: {'Authorization': 'Bearer $token'},
  metadata: {
    'filename': 'insp_$clientUuid.jpg',
    'filetype': 'image/jpeg',
    'inspection_id': clientUuid,
    'project_id': projectId,
    'hash': hash,
  },
  onProgress: (progress, estimate) {
    // Update local DB + UI progress
  },
  onComplete: () {
    final finalUrl = tusClient.uploadUrl.toString();
    // Mark outbox synced, update inspection with photo URL
  },
);
```

Use a persistent store (file-based, not just memory) so sessions survive process death. Limit concurrent uploads (1–2) to avoid saturating the network or battery.

**React Native**  
Use `react-native-tus-client` (wraps native TUSKit / tus-android-client) or `tus-js-client` with appropriate file handling.

**Native**  
- iOS: TUSKit  
- Android: tus-android-client  

Integrate with background execution (WorkManager on Android, BackgroundTasks / URLSession on iOS) so uploads can continue or resume when the app is backgrounded.

### Server Options
1. **Easiest – Supabase Storage**  
   Native TUS endpoint (`/storage/v1/upload/resumable`).  
   Pass auth token + metadata (bucket, object name, contentType).  
   Upload URL is valid ~24 hours. Supports upsert and hooks for post-processing.

2. **Self-hosted / custom – tusd**  
   Official reference server. Run it in front of your object storage.  
   Use hooks (HTTP or gRPC) on completion to:
   - Move/rename the file into the final inspection folder.
   - Insert/update the photo record in your database.
   - Generate thumbnails or run AI classification later.
   - Clean up expired incomplete uploads.

3. **Custom TUS middleware** or S3 Multipart proxy if you already have heavy S3 usage.

Always require authentication on the creation endpoint and validate the `inspection_id` / project ownership.

### Integration with Your Offline Sync Queue
- Treat photo upload as a separate high-priority outbox item (or a dependent task after the inspection metadata is created).
- Statuses: `pending` → `uploading` → `synced` / `failed`.
- On resume, the sync worker simply re-invokes the TUS client with the stored session.
- Show per-photo progress in the app (and overall queue status).
- Option: “Wi-Fi only” for large originals; allow cellular for compressed versions or critical Defects.
- After confirmed sync, optionally compress or delete the full-resolution local file to free space.

### Best Practices & Configuration
- **Chunk size**: 1–5 MB. Smaller = more resume points and lower memory; larger = less HTTP overhead.
- **Checksums**: Use the TUS checksum extension (or send SHA-256 in metadata) for integrity.
- **Retries**: Exponential backoff with jitter (e.g., 0, 3s, 5s, 10s, 20s…).
- **Expiration**: Configure server-side cleanup of abandoned uploads (e.g., 24–48 hours).
- **Fingerprinting**: Clients usually fingerprint by file content + size so the same photo can be resumed correctly.
- **Progress & UX**: Always show clear progress, “Resuming…”, and allow manual pause/resume or “Retry failed”.
- **Security**: Never expose long-lived credentials. Use short-lived tokens. Validate ownership on the server.
- **Thumbnails**: Generate on the server after completion (or create a small local preview for the UI while the full file uploads).
- **Testing**: Use network throttling / airplane mode toggles, kill the app mid-upload, and verify resume from the exact offset. Test with 10–20 MB photos.

### Minimal Viable Implementation Path
1. Add a TUS client library and persistent session store.
2. On the backend, stand up tusd or enable Supabase resumable uploads.
3. Wire the outbox so each photo becomes a resumable TUS task.
4. Add progress reporting and basic retry.
5. Add completion hook to finalize the inspection record.
6. Later: background execution, Wi-Fi preference, automatic cleanup, parallel limited uploads.

This approach pairs cleanly with the offline-first architecture and map caching already discussed. Once implemented, interrupted photo uploads become a non-event for field teams.

If you specify your exact stack (Flutter version, backend — Node/Firebase/Supabase/custom, storage — S3/local, etc.), I can provide more concrete code, schema for the outbox table, or server hook examples.