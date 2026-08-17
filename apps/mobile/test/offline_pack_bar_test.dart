import 'package:flaha_inspect/features/map/offline_pack_bar.dart';
import 'package:flaha_inspect/map/map_copy.dart';
import 'package:flaha_inspect/map/offline_pack.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('hides download when OSM bulk is forbidden', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OfflinePackBar(
            tiles: resolveTilePolicy(providerUrl: osmTemplate, isDev: true),
            hasPack: false,
            busy: false,
            progress: null,
            onDownload: () {},
            onDelete: () {},
          ),
        ),
      ),
    );
    expect(find.text(osmBulkForbidden), findsOneWidget);
    expect(find.text(downloadMapLabel), findsNothing);
  });

  testWidgets('shows download, progress, and delete for Flaha URL', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OfflinePackBar(
            tiles: resolveTilePolicy(
              providerUrl: 'http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png',
              isDev: false,
            ),
            hasPack: true,
            busy: true,
            progress: const PackProgress(done: 1, total: 2),
            onDownload: () {},
            onDelete: () {},
          ),
        ),
      ),
    );
    expect(find.text(downloadMapLabel), findsOneWidget);
    expect(find.textContaining('50%'), findsOneWidget);
    expect(find.text(deleteCacheLabel), findsOneWidget);
  });
}
