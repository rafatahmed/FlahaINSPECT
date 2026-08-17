import 'package:flaha_inspect/map/geojson.dart';
import 'package:flaha_inspect/map/offline_region.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('refuses public OSM and empty URL (KD-35 / KD-43)', () {
    expect(
      canBulkDownload(resolveTilePolicy(providerUrl: osmTemplate, isDev: false)),
      isFalse,
    );
    expect(
      canBulkDownload(resolveTilePolicy(providerUrl: null, isDev: false)),
      isFalse,
    );
    expect(
      canBulkDownload(
        resolveTilePolicy(
          providerUrl: 'http://127.0.0.1:8082/styles/basic-preview/{z}/{x}/{y}.png',
          isDev: false,
        ),
      ),
      isTrue,
    );
  });

  test('buffers 300 m and stays on zooms 12–17', () {
    final b = boundsWithBuffer(const [LatLngLite(25.286, 51.534), LatLngLite(25.290, 51.540)]);
    expect(b, isNotNull);
    expect(b!.maxLat - b.minLat, greaterThan(2 * packBufferMeters / 111320));
    final tiles = tilesForBounds(b);
    expect(tiles.every((t) => t.z >= packMinZoom && t.z <= packMaxZoom), isTrue);
    expect(tiles, isNotEmpty);
  });

  test('store id is per project', () {
    expect(packStoreId('abc'), 'project-abc');
    expect(
      tileUrl('http://t/{z}/{x}/{y}.png', const TileCoord(12, 3, 4)),
      'http://t/12/3/4.png',
    );
  });
}
