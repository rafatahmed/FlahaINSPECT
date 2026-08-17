import 'package:flaha_inspect/map/geojson.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('dev without URL uses OSM ambient and forbids bulk download', () {
    final p = resolveTilePolicy(providerUrl: '', isDev: true);
    expect(p.usesPublicOsm, isTrue);
    expect(p.allowBulkDownload, isFalse);
    expect(p.tilesAvailable, isTrue);
  });

  test('prod without URL has no tiles and no bulk (G-01)', () {
    final p = resolveTilePolicy(providerUrl: null, isDev: false);
    expect(p.tilesAvailable, isFalse);
    expect(p.allowBulkDownload, isFalse);
  });

  test('self-hosted TileServer GL URL allows bulk (G-01 / KD-43)', () {
    final p = resolveTilePolicy(
      providerUrl: 'http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png',
      isDev: false,
    );
    expect(p.allowBulkDownload, isTrue);
    expect(p.usesPublicOsm, isFalse);
    expect(p.tilesAvailable, isTrue);
  });

  test('licensed URL allows FMTC-style bulk; OSM URL does not', () {
    final licensed = resolveTilePolicy(
      providerUrl: 'https://tiles.example.com/{z}/{x}/{y}.png',
      isDev: false,
    );
    expect(licensed.allowBulkDownload, isTrue);
    expect(licensed.usesPublicOsm, isFalse);
    final osm = resolveTilePolicy(providerUrl: osmTemplate, isDev: false);
    expect(osm.allowBulkDownload, isFalse);
    expect(osm.usesPublicOsm, isTrue);
  });

  test('parses a GeoJSON polygon ring', () {
    const json =
        '{"type":"Polygon","coordinates":[[[51.5,25.2],[51.6,25.2],[51.6,25.3],[51.5,25.2]]]}';
    final ring = polygonRing(json);
    expect(ring.length, 4);
    expect(ring.first.latitude, 25.2);
    expect(ring.first.longitude, 51.5);
  });
}
