import 'dart:io';

import 'package:flaha_inspect/map/file_offline_packs.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test('downloads PNG tiles to a Flaha store and can delete them', () async {
    final tmp = await Directory.systemTemp.createTemp('flaha-tiles');
    addTearDown(() => tmp.delete(recursive: true));
    final client = MockClient((req) async {
      expect(req.headers['user-agent'], defaultUserAgent);
      return http.Response.bytes([1, 2, 3, 4], 200);
    });
    final packs = FileOfflinePacks(httpClient: client, root: tmp);
    final tiles = resolveTilePolicy(
      providerUrl: 'http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png',
      isDev: false,
    );
    final ok = await packs.download(
      projectId: 'p1',
      tiles: tiles,
      area: [(latitude: 25.286, longitude: 51.534)],
    );
    expect(ok, isTrue);
    expect(await packs.hasPack('p1'), isTrue);
    await packs.delete('p1');
    expect(await packs.hasPack('p1'), isFalse);
  });

  test('does not download when policy is public OSM', () async {
    final tmp = await Directory.systemTemp.createTemp('flaha-tiles-osm');
    addTearDown(() => tmp.delete(recursive: true));
    var hits = 0;
    final packs = FileOfflinePacks(
      httpClient: MockClient((_) async {
        hits += 1;
        return http.Response.bytes([1], 200);
      }),
      root: tmp,
    );
    final ok = await packs.download(
      projectId: 'p1',
      tiles: resolveTilePolicy(providerUrl: osmTemplate, isDev: true),
      area: [(latitude: 25.286, longitude: 51.534)],
    );
    expect(ok, isFalse);
    expect(hits, 0);
  });
}
