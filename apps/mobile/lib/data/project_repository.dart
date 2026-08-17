import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/db/app_database.dart';

class ProjectListItem {
  ProjectListItem({
    required this.id,
    required this.name,
    required this.isArchived,
    required this.pointCount,
    required this.pendingCount,
  });

  final String id;
  final String name;
  final bool isArchived;
  final int pointCount;
  final int pendingCount;
}

abstract class ProjectCatalog {
  Future<void> pullAll();
  Future<List<ProjectListItem>> listLocal();
}

class ProjectRepository implements ProjectCatalog {
  ProjectRepository({required this.db, required this.api});

  final AppDatabase db;
  final InspectApi api;

  @override
  Future<void> pullAll() async {
    String? sinceUpdatedAt;
    String? sinceId;
    var hasMore = true;
    while (hasMore) {
      final page = await api.syncProjects(
        sinceUpdatedAt: sinceUpdatedAt,
        sinceId: sinceId,
      );
      await _apply(page);
      hasMore = page.hasMore && page.nextCursor != null;
      sinceUpdatedAt = page.nextCursor?['since_updated_at'];
      sinceId = page.nextCursor?['since_id'];
    }
  }

  Future<void> _apply(DeltaPage page) async {
    await db.transaction(() async {
      for (final id in page.deletedIds) {
        await (db.delete(db.projects)..where((t) => t.id.equals(id))).go();
      }
      for (final item in page.items) {
        await db.into(db.projects).insertOnConflictUpdate(
              ProjectsCompanion(
                id: Value(item.id),
                name: Value(item.name),
                code: Value(item.code),
                description: Value(item.description),
                isArchived: Value(item.isArchived ? 1 : 0),
                updatedAt: Value(item.updatedAt),
                boundaryGeojson: Value(item.boundary == null ? null : jsonEncode(item.boundary)),
                bboxGeojson: Value(item.bbox == null ? null : jsonEncode(item.bbox)),
                lastPulledAt: Value(DateTime.now().toUtc().toIso8601String()),
              ),
            );
      }
      if (page.nextCursor != null) {
        await db.into(db.syncState).insertOnConflictUpdate(
              SyncStateCompanion(
                key: const Value('projects'),
                cursorUpdatedAt: Value(page.nextCursor!['since_updated_at']),
                cursorId: Value(page.nextCursor!['since_id']),
                serverTime: Value(page.serverTime),
                updatedAt: Value(DateTime.now().toUtc().toIso8601String()),
              ),
            );
      }
    });
  }

  @override
  Future<List<ProjectListItem>> listLocal() async {
    final rows = await (db.select(db.projects)..orderBy([(t) => OrderingTerm.asc(t.name)])).get();
    final items = <ProjectListItem>[];
    for (final row in rows) {
      final points = await (db.select(db.inspectionPoints)
            ..where((t) => t.projectId.equals(row.id)))
          .get();
      final pending = await (db.select(db.outbox)
            ..where((t) => t.status.equals('pending') | t.status.equals('in_progress')))
          .get();
      final pendingForProject = pending.where((o) => o.payloadJson.contains(row.id)).length;
      items.add(
        ProjectListItem(
          id: row.id,
          name: row.name,
          isArchived: row.isArchived == 1,
          pointCount: points.length,
          pendingCount: pendingForProject,
        ),
      );
    }
    return items;
  }
}
