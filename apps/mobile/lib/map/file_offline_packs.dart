import 'dart:io';

import 'package:flaha_inspect/map/geojson.dart';
import 'package:flaha_inspect/map/offline_pack.dart';
import 'package:flaha_inspect/map/offline_region.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

/// First-party store for the Flaha TileServer (KD-43). Same region as TDD FMTC
/// (z12–17, +300 m). We do not take GPL-3 FMTC into the app binary.
class FileOfflinePacks implements OfflinePacks {
  FileOfflinePacks({http.Client? httpClient, Directory? root})
      : _http = httpClient ?? http.Client(),
        _overrideRoot = root;

  final http.Client _http;
  final Directory? _overrideRoot;

  Future<Directory> _storeDir(String projectId) async {
    final base = _overrideRoot ?? await getApplicationDocumentsDirectory();
    return Directory(p.join(base.path, 'tile-packs', packStoreId(projectId)));
  }

  @override
  Future<String?> packRoot(String projectId) async {
    final dir = await _storeDir(projectId);
    if (await dir.exists()) return dir.path;
    return null;
  }

  @override
  Future<bool> hasPack(String projectId) async {
    final dir = await _storeDir(projectId);
    if (!await dir.exists()) return false;
    return dir.listSync(recursive: true).whereType<File>().isNotEmpty;
  }

  @override
  Future<void> delete(String projectId) async {
    final dir = await _storeDir(projectId);
    if (await dir.exists()) await dir.delete(recursive: true);
  }

  @override
  Future<bool> download({
    required String projectId,
    required TilePolicy tiles,
    required List<({double latitude, double longitude})> area,
    void Function(PackProgress p)? onProgress,
  }) async {
    if (!canBulkDownload(tiles)) return false;
    final ring = [for (final a in area) LatLngLite(a.latitude, a.longitude)];
    final bounds = boundsWithBuffer(ring);
    if (bounds == null) return false;
    final coords = tilesForBounds(bounds);
    if (coords.isEmpty) return false;
    final dir = await _storeDir(projectId);
    await dir.create(recursive: true);
    var done = 0;
    onProgress?.call(PackProgress(done: 0, total: coords.length));
    for (final t in coords) {
      final file = File(p.join(dir.path, '${t.z}', '${t.x}', '${t.y}.png'));
      if (!await file.exists()) {
        final uri = Uri.parse(tileUrl(tiles.urlTemplate, t));
        final res = await _http.get(uri, headers: {'user-agent': tiles.userAgent});
        if (res.statusCode == 200 && res.bodyBytes.isNotEmpty) {
          await file.parent.create(recursive: true);
          await file.writeAsBytes(res.bodyBytes, flush: true);
        }
      }
      done += 1;
      onProgress?.call(PackProgress(done: done, total: coords.length));
    }
    return true;
  }
}
