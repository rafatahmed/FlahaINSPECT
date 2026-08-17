import 'package:drift/drift.dart';

/// TDD mobile schema. Session JWTs are **not** columns (KD-37).
/// TUS `upload_token` on [Photos] is a 2h create/resume token, not an auth session.

class UsersLocal extends Table {
  @override
  String get tableName => 'users_local';

  TextColumn get id => text()();
  TextColumn get email => text()();
  TextColumn get fullName => text()();
  TextColumn get role => text()();
  IntColumn get tokenVersion => integer()();
  IntColumn get lastAuthAt => integer().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Projects extends Table {
  @override
  String get tableName => 'projects';

  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get code => text().nullable()();
  TextColumn get description => text().nullable()();
  TextColumn get boundaryGeojson => text().nullable()();
  TextColumn get bboxGeojson => text().nullable()();
  IntColumn get isArchived => integer().withDefault(const Constant(0))();
  TextColumn get updatedAt => text()();
  TextColumn get mapCacheStatus => text().nullable()();
  IntColumn get mapCacheBytes => integer().nullable()();
  TextColumn get lastPulledAt => text().nullable()();
  TextColumn get lastCursorUpdatedAt => text().nullable()();
  TextColumn get lastCursorId => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class InspectionPoints extends Table {
  @override
  String get tableName => 'inspection_points';

  TextColumn get clientUuid => text()();
  TextColumn get serverId => text().nullable()();
  TextColumn get projectId => text()();
  TextColumn get category => text()();
  TextColumn get note => text().nullable()();
  TextColumn get remarks => text().nullable()();
  TextColumn get recommendedProcedure => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('open'))();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  RealColumn get accuracyM => real().nullable()();
  RealColumn get altitudeM => real().nullable()();
  RealColumn get headingDeg => real().nullable()();
  TextColumn get locationSource => text().nullable()();
  IntColumn get locationAdjusted => integer().withDefault(const Constant(0))();
  IntColumn get outsideBoundary => integer().withDefault(const Constant(0))();
  TextColumn get capturedAt => text()();
  TextColumn get clientDeviceInfo => text().nullable()();
  IntColumn get version => integer().withDefault(const Constant(1))();
  TextColumn get syncStatus => text()();
  TextColumn get lastError => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {clientUuid};
}

class Photos extends Table {
  @override
  String get tableName => 'photos';

  TextColumn get clientUuid => text()();
  TextColumn get serverId => text().nullable()();
  TextColumn get pointClientUuid => text().unique()();
  TextColumn get projectId => text()();
  TextColumn get localOriginalPath => text()();
  TextColumn get localUploadPath => text()();
  TextColumn get localThumbPath => text().nullable()();
  TextColumn get sha256 => text()();
  IntColumn get byteSize => integer()();
  TextColumn get contentType => text()();
  IntColumn get widthPx => integer().nullable()();
  IntColumn get heightPx => integer().nullable()();
  TextColumn get tusUrl => text().nullable()();
  IntColumn get tusOffset => integer().withDefault(const Constant(0))();
  /// Short-lived TUS token (≤2h). Not a session JWT (KD-37).
  TextColumn get uploadToken => text().nullable()();
  TextColumn get tusUploadId => text().nullable()();
  TextColumn get syncStatus => text()();
  RealColumn get progressPct => real().withDefault(const Constant(0))();
  TextColumn get lastError => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {clientUuid};
}

class Outbox extends Table {
  @override
  String get tableName => 'outbox';

  TextColumn get id => text()();
  /// CreateInspectionPoint | UploadPhoto only. No UpdatePointLocal.
  TextColumn get type => text()();
  TextColumn get payloadJson => text()();
  TextColumn get dependsOn => text().nullable()();
  IntColumn get priority => integer()();
  TextColumn get status => text()();
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  TextColumn get nextAttemptAt => text().nullable()();
  TextColumn get lastError => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class SyncState extends Table {
  @override
  String get tableName => 'sync_state';

  TextColumn get key => text()();
  TextColumn get cursorUpdatedAt => text().nullable()();
  TextColumn get cursorId => text().nullable()();
  TextColumn get serverTime => text().nullable()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {key};
}

class MapRegions extends Table {
  @override
  String get tableName => 'map_regions';

  TextColumn get id => text()();
  TextColumn get projectId => text()();
  IntColumn get minZoom => integer()();
  IntColumn get maxZoom => integer()();
  TextColumn get boundsGeojson => text()();
  TextColumn get status => text()();
  IntColumn get bytes => integer().nullable()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

abstract final class OutboxType {
  static const createInspectionPoint = 'CreateInspectionPoint';
  static const uploadPhoto = 'UploadPhoto';
  static const allowed = {createInspectionPoint, uploadPhoto};
}
