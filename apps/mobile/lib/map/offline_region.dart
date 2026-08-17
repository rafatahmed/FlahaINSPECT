import 'dart:math' as math;

import 'package:flaha_inspect/map/geojson.dart';
import 'package:flaha_inspect/map/tile_policy.dart';

const packMinZoom = 12;
const packMaxZoom = 17;
const packBufferMeters = 300.0;

class GeoBounds {
  const GeoBounds({
    required this.minLat,
    required this.minLon,
    required this.maxLat,
    required this.maxLon,
  });

  final double minLat;
  final double minLon;
  final double maxLat;
  final double maxLon;
}

class TileCoord {
  const TileCoord(this.z, this.x, this.y);
  final int z;
  final int x;
  final int y;
}

String packStoreId(String projectId) => 'project-$projectId';

bool canBulkDownload(TilePolicy tiles) => tiles.allowBulkDownload && tiles.tilesAvailable;

/// Expand a polygon (or point list) by 300 m. Empty input → null.
GeoBounds? boundsWithBuffer(List<LatLngLite> ring, {double bufferM = packBufferMeters}) {
  if (ring.isEmpty) return null;
  var minLat = ring.first.latitude;
  var maxLat = ring.first.latitude;
  var minLon = ring.first.longitude;
  var maxLon = ring.first.longitude;
  for (final p in ring) {
    minLat = math.min(minLat, p.latitude);
    maxLat = math.max(maxLat, p.latitude);
    minLon = math.min(minLon, p.longitude);
    maxLon = math.max(maxLon, p.longitude);
  }
  final midLat = (minLat + maxLat) / 2;
  final dLat = bufferM / 111320.0;
  final cosLat = math.cos(midLat * math.pi / 180);
  final dLon = bufferM / (111320.0 * (cosLat.abs() < 0.2 ? 0.2 : cosLat.abs()));
  return GeoBounds(
    minLat: minLat - dLat,
    maxLat: maxLat + dLat,
    minLon: minLon - dLon,
    maxLon: maxLon + dLon,
  );
}

int lon2tile(double lon, int z) {
  final n = 1 << z;
  var x = ((lon + 180.0) / 360.0 * n).floor();
  if (x < 0) x = 0;
  if (x >= n) x = n - 1;
  return x;
}

int lat2tile(double lat, int z) {
  final n = 1 << z;
  final latRad = lat * math.pi / 180;
  final y = ((1 - math.log(math.tan(latRad) + 1 / math.cos(latRad)) / math.pi) / 2 * n).floor();
  if (y < 0) return 0;
  if (y >= n) return n - 1;
  return y;
}

List<TileCoord> tilesForBounds(GeoBounds b, {int minZ = packMinZoom, int maxZ = packMaxZoom}) {
  final out = <TileCoord>[];
  for (var z = minZ; z <= maxZ; z++) {
    final x0 = lon2tile(b.minLon, z);
    final x1 = lon2tile(b.maxLon, z);
    final y0 = lat2tile(b.maxLat, z);
    final y1 = lat2tile(b.minLat, z);
    for (var x = math.min(x0, x1); x <= math.max(x0, x1); x++) {
      for (var y = math.min(y0, y1); y <= math.max(y0, y1); y++) {
        out.add(TileCoord(z, x, y));
      }
    }
  }
  return out;
}

String tileUrl(String template, TileCoord t) {
  return template
      .replaceAll('{z}', '${t.z}')
      .replaceAll('{x}', '${t.x}')
      .replaceAll('{y}', '${t.y}');
}
