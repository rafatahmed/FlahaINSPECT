import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:flaha_inspect/capture/capture_draft.dart';
import 'package:flaha_inspect/capture/compress.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/db/app_database.dart';
import 'package:flaha_inspect/db/tables.dart';
import 'package:uuid/uuid.dart';

abstract class CaptureGateway {
  Future<void> save(CaptureDraft draft);
}

class CaptureRepository implements CaptureGateway {
  CaptureRepository({
    required this.db,
    required this.files,
    this.appVersion = '0.0.1',
    Uuid? ids,
  }) : _ids = ids ?? const Uuid();

  final AppDatabase db;
  final PhotoFiles files;
  final String appVersion;
  final Uuid _ids;

  @override
  Future<void> save(CaptureDraft draft) async {
    final reason = draft.blockReason;
    if (reason != null) {
      throw StateError(reason);
    }
    final fix = draft.fix!;
    final original = draft.originalBytes!;
    final candidate = compressUploadCandidate(original);
    final pointId = _ids.v4();
    final photoId = _ids.v4();
    final createOutboxId = _ids.v4();
    final uploadOutboxId = _ids.v4();
    final now = DateTime.now().toUtc().toIso8601String();
    final capturedAt = now;
    final paths = await files.write(
      projectId: draft.projectId,
      photoUuid: photoId,
      original: original,
      upload: candidate.bytes,
      thumb: candidate.thumbBytes,
    );
    final payloads = buildOutboxPayloads(
      pointClientUuid: pointId,
      photoClientUuid: photoId,
      projectId: draft.projectId,
      category: draft.category!,
      note: draft.note,
      fix: fix,
      locationAdjusted: draft.locationAdjusted,
      capturedAt: capturedAt,
      sha256: candidate.sha256,
      byteSize: candidate.bytes.length,
      localUploadPath: paths.upload,
      appVersion: appVersion,
    );

    await db.transaction(() async {
      await db.into(db.inspectionPoints).insert(
            InspectionPointsCompanion.insert(
              clientUuid: pointId,
              projectId: draft.projectId,
              category: draft.category!,
              note: Value(draft.note),
              latitude: fix.latitude,
              longitude: fix.longitude,
              accuracyM: Value(fix.accuracyM),
              altitudeM: Value(fix.altitudeM),
              headingDeg: Value(fix.headingDeg),
              locationSource: Value(fix.source),
              locationAdjusted: Value(draft.locationAdjusted ? 1 : 0),
              capturedAt: capturedAt,
              syncStatus: 'pending',
              createdAt: now,
              updatedAt: now,
            ),
          );
      await db.into(db.photos).insert(
            PhotosCompanion.insert(
              clientUuid: photoId,
              pointClientUuid: pointId,
              projectId: draft.projectId,
              localOriginalPath: paths.original,
              localUploadPath: paths.upload,
              localThumbPath: Value(paths.thumb),
              sha256: candidate.sha256,
              byteSize: candidate.bytes.length,
              contentType: 'image/jpeg',
              widthPx: Value(candidate.width),
              heightPx: Value(candidate.height),
              syncStatus: 'pending',
              createdAt: now,
              updatedAt: now,
            ),
          );
      await db.into(db.outbox).insert(
            OutboxCompanion.insert(
              id: createOutboxId,
              type: OutboxType.createInspectionPoint,
              payloadJson: jsonEncode(payloads.createInspectionPoint),
              priority: 10,
              status: 'pending',
              createdAt: now,
              updatedAt: now,
            ),
          );
      await db.into(db.outbox).insert(
            OutboxCompanion.insert(
              id: uploadOutboxId,
              type: OutboxType.uploadPhoto,
              payloadJson: jsonEncode(payloads.uploadPhoto),
              dependsOn: Value(createOutboxId),
              priority: 20,
              status: 'pending',
              createdAt: now,
              updatedAt: now,
            ),
          );
    });
  }
}
