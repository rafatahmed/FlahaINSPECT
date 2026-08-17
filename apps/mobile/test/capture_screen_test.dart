import 'dart:typed_data';

import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/capture_draft.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:flaha_inspect/data/capture_repository.dart';
import 'package:flaha_inspect/features/capture/capture_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class _Loc implements LocationSource {
  _Loc(this.fix);
  final GeoFix? fix;
  @override
  Future<GeoFix?> acquire({Duration timeout = gpsAcquireTimeout}) async => fix;
}

class _Photos implements PhotoSource {
  @override
  Future<Uint8List?> capture() async => Uint8List.fromList([1, 2, 3]);
}

class _Disk implements DiskSpace {
  _Disk(this.bytes);
  final int? bytes;
  @override
  Future<int?> freeBytes() async => bytes;
}

class _Cap implements CaptureGateway {
  CaptureDraft? last;
  @override
  Future<void> save(CaptureDraft draft) async => last = draft;
}

void main() {
  testWidgets('shows GPS, categories, and save; no second-photo control', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CaptureScreen(
          projectId: 'p',
          projectName: 'West Bay',
          archived: false,
          capture: _Cap(),
          location: _Loc(const GeoFix(latitude: 25, longitude: 51, accuracyM: 4.2)),
          photos: _Photos(),
          disk: _Disk(null),
          seedFix: const GeoFix(latitude: 25, longitude: 51, accuracyM: 4.2),
        ),
      ),
    );
    await tester.pump();
    expect(find.text(captureTitle), findsOneWidget);
    expect(find.textContaining('GPS 4.2 m'), findsOneWidget);
    expect(find.text('Defect'), findsOneWidget);
    expect(find.text('Normal'), findsOneWidget);
    expect(find.text('Note'), findsOneWidget);
    expect(find.text(saveLocallyLabel), findsOneWidget);
    expect(find.text(adjustPinLabel), findsOneWidget);
    expect(find.textContaining('second photo'), findsNothing);
  });

  testWidgets('soft-warns when GPS is worse than 10 m', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CaptureScreen(
          projectId: 'p',
          projectName: 'West Bay',
          archived: false,
          capture: _Cap(),
          location: _Loc(const GeoFix(latitude: 25, longitude: 51, accuracyM: 18)),
          photos: _Photos(),
          disk: _Disk(null),
          seedFix: const GeoFix(latitude: 25, longitude: 51, accuracyM: 18),
        ),
      ),
    );
    await tester.pump();
    expect(find.text(gpsImpreciseBanner), findsOneWidget);
  });

  testWidgets('blocks capture when disk is under 200 MB', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CaptureScreen(
          projectId: 'p',
          projectName: 'West Bay',
          archived: false,
          capture: _Cap(),
          location: _Loc(const GeoFix(latitude: 25, longitude: 51, accuracyM: 4)),
          photos: _Photos(),
          disk: _Disk(50 * 1024 * 1024),
          seedFreeBytes: 50 * 1024 * 1024,
        ),
      ),
    );
    await tester.pump();
    expect(find.text(storageBlockCopy), findsOneWidget);
    final button = tester.widget<FilledButton>(find.widgetWithText(FilledButton, saveLocallyLabel));
    expect(button.onPressed, isNull);
  });
}
