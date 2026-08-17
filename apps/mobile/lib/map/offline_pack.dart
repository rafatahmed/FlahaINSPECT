import 'package:flaha_inspect/map/tile_policy.dart';

class PackProgress {
  const PackProgress({required this.done, required this.total});
  final int done;
  final int total;
  double get fraction => total == 0 ? 0 : done / total;
}

abstract class OfflinePacks {
  Future<bool> hasPack(String projectId);

  /// Returns false if policy forbids bulk (public OSM / empty URL) or no area.
  Future<bool> download({
    required String projectId,
    required TilePolicy tiles,
    required List<({double latitude, double longitude})> area,
    void Function(PackProgress p)? onProgress,
  });

  Future<void> delete(String projectId);

  /// Root used by the map tile provider. Empty if none.
  Future<String?> packRoot(String projectId);
}
