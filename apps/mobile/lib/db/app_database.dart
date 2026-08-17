import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:drift_flutter/drift_flutter.dart';

import 'tables.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    UsersLocal,
    Projects,
    InspectionPoints,
    Photos,
    Outbox,
    SyncState,
    MapRegions,
  ],
)
class AppDatabase extends _$AppDatabase {
  /// Device / default: `drift_flutter` opens the app-support SQLite file.
  AppDatabase() : super(_open());

  /// Tests: in-memory SQLite (no files).
  AppDatabase.memory() : super(NativeDatabase.memory());

  AppDatabase.connect(super.e);

  static QueryExecutor _open() {
    return driftDatabase(name: 'flaha_inspect');
  }

  @override
  int get schemaVersion => 1;
}
