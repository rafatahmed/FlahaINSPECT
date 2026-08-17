import 'dart:typed_data';

import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/capture_draft.dart';
import 'package:flaha_inspect/capture/compress.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:flaha_inspect/db/tables.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;

Uint8List _jpeg({int w = 2000, int h = 1000}) {
  final image = img.Image(width: w, height: h);
  img.fill(image, color: img.ColorRgb8(10, 20, 30));
  return Uint8List.fromList(img.encodeJpg(image, quality: 90));
}

void main() {
  test('GPS soft-warn is only above 10 m', () {
    expect(gpsNeedsSoftWarn(4.2), isFalse);
    expect(gpsNeedsSoftWarn(10), isFalse);
    expect(gpsNeedsSoftWarn(10.1), isTrue);
  });

  test('storage warn at 500 MB and block at 200 MB', () {
    expect(storageVerdict(600 * 1024 * 1024), StorageVerdict.ok);
    expect(storageVerdict(400 * 1024 * 1024), StorageVerdict.warn);
    expect(storageVerdict(100 * 1024 * 1024), StorageVerdict.block);
  });

  test('create-once draft requires photo, category, and GPS', () {
    const base = CaptureDraft(projectId: 'p1');
    expect(base.canSave, isFalse);
    expect(base.blockReason, photoRequired);
    expect(
      base
          .copyWith(
            originalBytes: Uint8List.fromList([1]),
            category: categoryDefect,
            fix: const GeoFix(latitude: 25, longitude: 51, accuracyM: 4),
          )
          .canSave,
      isTrue,
    );
    expect(
      const CaptureDraft(projectId: 'p1', projectArchived: true).blockReason,
      archivedNoCapture,
    );
  });

  test('outbox payloads are CreateInspectionPoint + UploadPhoto only', () {
    final payloads = buildOutboxPayloads(
      pointClientUuid: 'pt',
      photoClientUuid: 'ph',
      projectId: 'proj',
      category: categoryDefect,
      note: 'leak',
      fix: const GeoFix(latitude: 25.2, longitude: 51.5, accuracyM: 4.2),
      locationAdjusted: false,
      capturedAt: '2026-08-17T00:00:00.000Z',
      sha256: 'aa',
      byteSize: 12,
      localUploadPath: '/tmp/u.jpg',
      appVersion: '0.0.1',
    );
    expect(payloads.isCreateOnce, isTrue);
    expect(payloads.createInspectionPoint['type'], OutboxType.createInspectionPoint);
    expect(payloads.uploadPhoto['type'], OutboxType.uploadPhoto);
    expect(payloads.createInspectionPoint['type'], isNot('UpdatePointLocal'));
  });

  test('upload candidate is max 1920 JPEG and hashed', () {
    final out = compressUploadCandidate(_jpeg());
    expect(out.width, 1920);
    expect(out.height, 960);
    expect(out.sha256, hasLength(64));
    expect(out.bytes.length, lessThan(2 * 1024 * 1024));
    final again = img.decodeImage(out.bytes)!;
    expect(again.width, 1920);
  });
}
