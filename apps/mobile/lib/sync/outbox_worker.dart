import 'dart:convert';
import 'dart:math';

import 'package:drift/drift.dart';
import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/db/app_database.dart';
import 'package:flaha_inspect/db/tables.dart';
import 'package:flaha_inspect/sync/delta_merge.dart';
import 'package:flaha_inspect/sync/sync_policy.dart';
import 'package:flaha_inspect/sync/tus_client.dart';

class SyncItem {
  const SyncItem({
    required this.pointClientUuid,
    required this.category,
    this.note,
    required this.syncStatus,
    this.progressPct,
    this.lastError,
    required this.capturedAt,
    this.accuracyM,
    this.retryable = true,
  });

  final String pointClientUuid;
  final String category;
  final String? note;
  final String syncStatus;
  final double? progressPct;
  final String? lastError;
  final String capturedAt;
  final double? accuracyM;
  final bool retryable;
}

class OutboxWorker {
  OutboxWorker({
    required this.db,
    required this.api,
    required this.files,
    required this.tus,
    this.network = const AlwaysOnNetwork(),
    Random? random,
  }) : _random = random ?? Random();

  final AppDatabase db;
  final InspectApi api;
  final PhotoFiles files;
  final TusClient tus;
  final NetworkStatus network;
  final Random _random;

  static const wifiPrefKey = 'prefs:wifi_only';
  static const lastSyncKey = 'sync:last';

  Future<bool> wifiOnly() async {
    final row = await (db.select(db.syncState)..where((t) => t.key.equals(wifiPrefKey))).getSingleOrNull();
    return row?.cursorId == '1';
  }

  Future<void> setWifiOnly(bool value) async {
    await db.into(db.syncState).insertOnConflictUpdate(
          SyncStateCompanion(
            key: const Value(wifiPrefKey),
            cursorId: Value(value ? '1' : '0'),
            updatedAt: Value(DateTime.now().toUtc().toIso8601String()),
          ),
        );
  }

  Future<String?> lastSyncAt() async {
    final row = await (db.select(db.syncState)..where((t) => t.key.equals(lastSyncKey))).getSingleOrNull();
    return row?.updatedAt;
  }

  Future<int> pendingCount(String projectId) async {
    final rows = await (db.select(db.outbox)
          ..where((t) => t.status.equals('pending') | t.status.equals('in_progress')))
        .get();
    return rows.where((r) => r.payloadJson.contains(projectId)).length;
  }

  Future<List<SyncItem>> listForProject(String projectId) async {
    final points = await (db.select(db.inspectionPoints)
          ..where((t) => t.projectId.equals(projectId))
          ..orderBy([(t) => OrderingTerm.desc(t.capturedAt)]))
        .get();
    final items = <SyncItem>[];
    for (final p in points) {
      final photo = await (db.select(db.photos)..where((t) => t.pointClientUuid.equals(p.clientUuid)))
          .getSingleOrNull();
      items.add(
        SyncItem(
          pointClientUuid: p.clientUuid,
          category: p.category,
          note: p.note,
          syncStatus: p.syncStatus,
          progressPct: photo?.progressPct,
          lastError: p.lastError ?? photo?.lastError,
          capturedAt: p.capturedAt,
          accuracyM: p.accuracyM,
          retryable: isRetryableError(_codeFrom(p.lastError ?? photo?.lastError)),
        ),
      );
    }
    return items;
  }

  Future<void> retry(String pointClientUuid) async {
    final point = await (db.select(db.inspectionPoints)
          ..where((t) => t.clientUuid.equals(pointClientUuid)))
        .getSingle();
    if (!isRetryableError(_codeFrom(point.lastError))) return;
    final now = DateTime.now().toUtc().toIso8601String();
    await (db.update(db.outbox)..where((t) => t.payloadJson.contains(pointClientUuid))).write(
      OutboxCompanion(
        status: const Value('pending'),
        nextAttemptAt: Value(now),
        updatedAt: Value(now),
      ),
    );
    await (db.update(db.inspectionPoints)..where((t) => t.clientUuid.equals(pointClientUuid))).write(
      const InspectionPointsCompanion(syncStatus: Value('pending'), lastError: Value(null)),
    );
  }

  Future<void> tick({String? activeProjectId}) async {
    final wifiOnlyPref = await wifiOnly();
    if (!shouldSyncNow(
      wifiOnly: wifiOnlyPref,
      online: await network.isOnline,
      wifi: await network.isWifi,
    )) {
      return;
    }

    while (true) {
      final item = await _nextPending();
      if (item == null) break;
      try {
        await _process(item);
        await _finishOk(item);
      } on ApiException catch (err) {
        await _finishFail(item, err.code, err.message);
      } catch (err) {
        await _finishFail(item, null, err.toString());
      }
    }

    await api.syncProjects();
    if (activeProjectId != null) {
      await _pullPoints(activeProjectId);
    }
    await db.into(db.syncState).insertOnConflictUpdate(
          SyncStateCompanion(
            key: const Value(lastSyncKey),
            updatedAt: Value(DateTime.now().toUtc().toIso8601String()),
          ),
        );
  }

  Future<OutboxData?> _nextPending() async {
    final now = DateTime.now().toUtc().toIso8601String();
    final rows = await (db.select(db.outbox)
          ..where((t) => t.status.equals('pending'))
          ..orderBy([
            (t) => OrderingTerm.asc(t.priority),
            (t) => OrderingTerm.asc(t.createdAt),
          ]))
        .get();
    for (final row in rows) {
      if (row.nextAttemptAt != null && row.nextAttemptAt!.compareTo(now) > 0) continue;
      if (row.dependsOn != null) {
        final parent = await (db.select(db.outbox)..where((t) => t.id.equals(row.dependsOn!)))
            .getSingleOrNull();
        if (parent != null && parent.status != 'done') continue;
      }
      await (db.update(db.outbox)..where((t) => t.id.equals(row.id))).write(
        const OutboxCompanion(status: Value('in_progress')),
      );
      return row;
    }
    return null;
  }

  Future<void> _process(OutboxData item) async {
    final payload = jsonDecode(item.payloadJson) as Map<String, dynamic>;
    if (item.type == OutboxType.createInspectionPoint) {
      await _pushPoint(payload);
      return;
    }
    if (item.type == OutboxType.uploadPhoto) {
      await _pushPhoto(payload);
      return;
    }
    throw StateError('unknown outbox type ${item.type}');
  }

  Future<void> _pushPoint(Map<String, dynamic> payload) async {
    final body = <String, Object?>{
      'client_uuid': payload['client_uuid'],
      'project_id': payload['project_id'],
      'category': payload['category'],
      'note': payload['note'],
      'latitude': payload['latitude'],
      'longitude': payload['longitude'],
      'accuracy_m': payload['accuracy_m'],
      'location_adjusted': payload['location_adjusted'],
      'captured_at': payload['captured_at'],
      'location_source': payload['location_source'] ?? 'phone_gps',
      'client_device_info': payload['device'],
    };
    final res = await api.createInspectionPoint(body);
    final point = res['point'] as Map<String, dynamic>;
    await (db.update(db.inspectionPoints)
          ..where((t) => t.clientUuid.equals(payload['client_uuid'] as String)))
        .write(
      InspectionPointsCompanion(
        serverId: Value(point['id'] as String?),
        syncStatus: const Value('synced'),
        lastError: const Value(null),
      ),
    );
  }

  Future<void> _pushPhoto(Map<String, dynamic> payload) async {
    final pointUuid = payload['point_client_uuid'] as String;
    final photoUuid = payload['photo_client_uuid'] as String;
    final point = await (db.select(db.inspectionPoints)..where((t) => t.clientUuid.equals(pointUuid)))
        .getSingle();
    if (point.serverId == null) {
      throw StateError('parent point not synced');
    }
    final photo = await (db.select(db.photos)..where((t) => t.clientUuid.equals(photoUuid))).getSingle();
    final registered = await api.registerPhoto({
      'client_uuid': photoUuid,
      'inspection_point_client_uuid': pointUuid,
      'project_id': payload['project_id'],
      'sha256': payload['sha256'],
      'byte_size': payload['byte_size'],
      'content_type': payload['content_type'] ?? 'image/jpeg',
    });
    final rec = registered['photo'] as Map<String, dynamic>;
    final token = rec['upload_token'] as String?;
    final uploadUrl = rec['upload_url'] as String?;
    final serverId = rec['id'] as String?;
    if (serverId != null) {
      await (db.update(db.photos)..where((t) => t.clientUuid.equals(photoUuid))).write(
        PhotosCompanion(serverId: Value(serverId)),
      );
    }
    if (token != null && uploadUrl != null && rec['status'] != 'ready') {
      final bytes = await files.readUpload(photo.localUploadPath);
      final created = photo.tusUrl == null
          ? await tus.create(
              endpoint: Uri.parse(uploadUrl),
              length: bytes.length,
              uploadToken: token,
              meta: {
                'filename': '$photoUuid.jpg',
                'filetype': 'image/jpeg',
                'photo_client_uuid': photoUuid,
                'authorization': token,
              },
            )
          : Uri.parse(photo.tusUrl!);
      await (db.update(db.photos)..where((t) => t.clientUuid.equals(photoUuid))).write(
        PhotosCompanion(tusUrl: Value(created.toString()), syncStatus: const Value('syncing')),
      );
      await tus.uploadAll(
        url: created,
        uploadToken: token,
        bytes: bytes,
        onProgress: (sent, total) async {
          final pct = total == 0 ? 0.0 : (sent / total) * 100;
          await (db.update(db.photos)..where((t) => t.clientUuid.equals(photoUuid))).write(
            PhotosCompanion(progressPct: Value(pct), tusOffset: Value(sent)),
          );
        },
      );
      if (serverId != null) {
        await _waitReady(serverId);
      }
    }
    await (db.update(db.photos)..where((t) => t.clientUuid.equals(photoUuid))).write(
      const PhotosCompanion(syncStatus: Value('synced'), progressPct: Value(100), lastError: Value(null)),
    );
  }

  Future<void> _waitReady(String photoId) async {
    for (var i = 0; i < 8; i++) {
      final res = await api.getPhoto(photoId);
      final photo = res['photo'] as Map<String, dynamic>;
      final status = photo['status'] as String?;
      if (status == 'ready' || status == 'failed') return;
    }
  }

  Future<void> _pullPoints(String projectId) async {
    final page = await api.syncProjectPoints(projectId);
    final items = (page['items'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
    for (final raw in items) {
      final server = ServerPointDelta(
        id: raw['id'] as String,
        clientUuid: raw['client_uuid'] as String,
        category: raw['category'] as String,
        note: raw['note'] as String?,
        remarks: raw['remarks'] as String?,
        recommendedProcedure: raw['recommended_procedure'] as String?,
        status: raw['status'] as String? ?? 'open',
        version: (raw['version'] as num?)?.toInt() ?? 1,
        latitude: (raw['latitude'] as num).toDouble(),
        longitude: (raw['longitude'] as num).toDouble(),
      );
      final local = await (db.select(db.inspectionPoints)
            ..where((t) => t.clientUuid.equals(server.clientUuid)))
          .getSingleOrNull();
      final action = mergePointAction(
        local == null
            ? null
            : LocalPointDelta(
                clientUuid: local.clientUuid,
                syncStatus: local.syncStatus,
                version: local.version,
              ),
        server,
      );
      if (action == MergeAction.applyDashboardOnly && local != null) {
        await (db.update(db.inspectionPoints)..where((t) => t.clientUuid.equals(server.clientUuid)))
            .write(
          InspectionPointsCompanion(
            remarks: Value(server.remarks),
            recommendedProcedure: Value(server.recommendedProcedure),
            status: Value(server.status),
            version: Value(server.version),
            serverId: Value(server.id),
          ),
        );
      }
    }
    for (final id in (page['deleted_ids'] as List<dynamic>? ?? []).cast<String>()) {
      await (db.delete(db.inspectionPoints)..where((t) => t.serverId.equals(id))).go();
    }
  }

  Future<void> _finishOk(OutboxData item) async {
    final now = DateTime.now().toUtc().toIso8601String();
    await (db.update(db.outbox)..where((t) => t.id.equals(item.id))).write(
      OutboxCompanion(status: const Value('done'), lastError: const Value(null), updatedAt: Value(now)),
    );
  }

  Future<void> _finishFail(OutboxData item, String? code, String message) async {
    final attempts = item.attempts + 1;
    final retry = isRetryableError(code) && attempts < maxOutboxAttempts;
    final delay = backoffFor(attempts, jitterMs: _random.nextInt(3000));
    final next = DateTime.now().toUtc().add(delay).toIso8601String();
    final now = DateTime.now().toUtc().toIso8601String();
    await (db.update(db.outbox)..where((t) => t.id.equals(item.id))).write(
      OutboxCompanion(
        status: Value(retry ? 'pending' : 'dead'),
        attempts: Value(attempts),
        nextAttemptAt: Value(next),
        lastError: Value(code == null ? message : '$code: $message'),
        updatedAt: Value(now),
      ),
    );
    final payload = jsonDecode(item.payloadJson) as Map<String, dynamic>;
    final pointId = (payload['client_uuid'] ?? payload['point_client_uuid']) as String?;
    if (pointId != null) {
      await (db.update(db.inspectionPoints)..where((t) => t.clientUuid.equals(pointId))).write(
        InspectionPointsCompanion(
          syncStatus: Value(retry ? 'failed' : 'failed'),
          lastError: Value(code == null ? message : '$code: $message'),
        ),
      );
    }
  }

  String? _codeFrom(String? error) {
    if (error == null) return null;
    final idx = error.indexOf(':');
    if (idx <= 0) return error;
    return error.substring(0, idx);
  }
}
