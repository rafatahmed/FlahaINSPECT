import 'dart:typed_data';

import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/db/tables.dart';

const noteMaxLength = 4000;

class CaptureDraft {
  const CaptureDraft({
    required this.projectId,
    this.projectArchived = false,
    this.category,
    this.note,
    this.fix,
    this.locationAdjusted = false,
    this.originalBytes,
  });

  final String projectId;
  final bool projectArchived;
  final String? category;
  final String? note;
  final GeoFix? fix;
  final bool locationAdjusted;
  final Uint8List? originalBytes;

  CaptureDraft copyWith({
    String? category,
    String? note,
    GeoFix? fix,
    bool? locationAdjusted,
    Uint8List? originalBytes,
  }) {
    return CaptureDraft(
      projectId: projectId,
      projectArchived: projectArchived,
      category: category ?? this.category,
      note: note ?? this.note,
      fix: fix ?? this.fix,
      locationAdjusted: locationAdjusted ?? this.locationAdjusted,
      originalBytes: originalBytes ?? this.originalBytes,
    );
  }

  /// Null when the draft may be saved.
  String? get blockReason {
    if (projectArchived) return archivedNoCapture;
    if (originalBytes == null || originalBytes!.isEmpty) return photoRequired;
    if (category == null || !categoryLabels.containsKey(category)) {
      return categoryRequired;
    }
    if (fix == null) return 'Waiting for GPS.';
    final trimmed = note ?? '';
    if (trimmed.length > noteMaxLength) return noteTooLong;
    return null;
  }

  bool get canSave => blockReason == null;
}

class OutboxPayloads {
  const OutboxPayloads({
    required this.createInspectionPoint,
    required this.uploadPhoto,
  });

  final Map<String, Object?> createInspectionPoint;
  final Map<String, Object?> uploadPhoto;

  bool get isCreateOnce {
    return createInspectionPoint['type'] == OutboxType.createInspectionPoint &&
        uploadPhoto['type'] == OutboxType.uploadPhoto &&
        createInspectionPoint['type'] != 'UpdatePointLocal';
  }
}

OutboxPayloads buildOutboxPayloads({
  required String pointClientUuid,
  required String photoClientUuid,
  required String projectId,
  required String category,
  required String? note,
  required GeoFix fix,
  required bool locationAdjusted,
  required String capturedAt,
  required String sha256,
  required int byteSize,
  required String localUploadPath,
  required String appVersion,
}) {
  return OutboxPayloads(
    createInspectionPoint: {
      'type': OutboxType.createInspectionPoint,
      'client_uuid': pointClientUuid,
      'project_id': projectId,
      'category': category,
      'note': note,
      'latitude': fix.latitude,
      'longitude': fix.longitude,
      'accuracy_m': fix.accuracyM,
      'location_adjusted': locationAdjusted,
      'captured_at': capturedAt,
      'location_source': fix.source,
      'device': {'app': appVersion},
    },
    uploadPhoto: {
      'type': OutboxType.uploadPhoto,
      'photo_client_uuid': photoClientUuid,
      'point_client_uuid': pointClientUuid,
      'project_id': projectId,
      'sha256': sha256,
      'byte_size': byteSize,
      'content_type': 'image/jpeg',
      'local_upload_path': localUploadPath,
    },
  );
}
