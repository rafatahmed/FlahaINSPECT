import 'package:flaha_inspect/db/app_database.dart';

class MapMarker {
  const MapMarker({
    required this.clientUuid,
    required this.category,
    required this.latitude,
    required this.longitude,
    required this.capturedAt,
    this.note,
    this.thumbPath,
  });

  final String clientUuid;
  final String category;
  final double latitude;
  final double longitude;
  final String capturedAt;
  final String? note;
  final String? thumbPath;
}

class MapProject {
  const MapProject({
    required this.id,
    required this.name,
    required this.isArchived,
    this.boundaryGeojson,
  });

  final String id;
  final String name;
  final bool isArchived;
  final String? boundaryGeojson;
}

class MapRepository {
  MapRepository(this.db);
  final AppDatabase db;

  Future<MapProject?> project(String id) async {
    final row = await (db.select(db.projects)..where((t) => t.id.equals(id))).getSingleOrNull();
    if (row == null) return null;
    return MapProject(
      id: row.id,
      name: row.name,
      isArchived: row.isArchived == 1,
      boundaryGeojson: row.boundaryGeojson,
    );
  }

  Future<List<MapMarker>> markers(String projectId) async {
    final points = await (db.select(db.inspectionPoints)..where((t) => t.projectId.equals(projectId))).get();
    final out = <MapMarker>[];
    for (final p in points) {
      final photo = await (db.select(db.photos)..where((t) => t.pointClientUuid.equals(p.clientUuid)))
          .getSingleOrNull();
      out.add(
        MapMarker(
          clientUuid: p.clientUuid,
          category: p.category,
          latitude: p.latitude,
          longitude: p.longitude,
          capturedAt: p.capturedAt,
          note: p.note,
          thumbPath: photo?.localThumbPath,
        ),
      );
    }
    return out;
  }
}
