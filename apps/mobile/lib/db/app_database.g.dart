// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $UsersLocalTable extends UsersLocal
    with TableInfo<$UsersLocalTable, UsersLocalData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UsersLocalTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _fullNameMeta =
      const VerificationMeta('fullName');
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
      'full_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _tokenVersionMeta =
      const VerificationMeta('tokenVersion');
  @override
  late final GeneratedColumn<int> tokenVersion = GeneratedColumn<int>(
      'token_version', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _lastAuthAtMeta =
      const VerificationMeta('lastAuthAt');
  @override
  late final GeneratedColumn<int> lastAuthAt = GeneratedColumn<int>(
      'last_auth_at', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, email, fullName, role, tokenVersion, lastAuthAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'users_local';
  @override
  VerificationContext validateIntegrity(Insertable<UsersLocalData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    } else if (isInserting) {
      context.missing(_emailMeta);
    }
    if (data.containsKey('full_name')) {
      context.handle(_fullNameMeta,
          fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta));
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    } else if (isInserting) {
      context.missing(_roleMeta);
    }
    if (data.containsKey('token_version')) {
      context.handle(
          _tokenVersionMeta,
          tokenVersion.isAcceptableOrUnknown(
              data['token_version']!, _tokenVersionMeta));
    } else if (isInserting) {
      context.missing(_tokenVersionMeta);
    }
    if (data.containsKey('last_auth_at')) {
      context.handle(
          _lastAuthAtMeta,
          lastAuthAt.isAcceptableOrUnknown(
              data['last_auth_at']!, _lastAuthAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  UsersLocalData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return UsersLocalData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email'])!,
      fullName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}full_name'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      tokenVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}token_version'])!,
      lastAuthAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}last_auth_at']),
    );
  }

  @override
  $UsersLocalTable createAlias(String alias) {
    return $UsersLocalTable(attachedDatabase, alias);
  }
}

class UsersLocalData extends DataClass implements Insertable<UsersLocalData> {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final int tokenVersion;
  final int? lastAuthAt;
  const UsersLocalData(
      {required this.id,
      required this.email,
      required this.fullName,
      required this.role,
      required this.tokenVersion,
      this.lastAuthAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['email'] = Variable<String>(email);
    map['full_name'] = Variable<String>(fullName);
    map['role'] = Variable<String>(role);
    map['token_version'] = Variable<int>(tokenVersion);
    if (!nullToAbsent || lastAuthAt != null) {
      map['last_auth_at'] = Variable<int>(lastAuthAt);
    }
    return map;
  }

  UsersLocalCompanion toCompanion(bool nullToAbsent) {
    return UsersLocalCompanion(
      id: Value(id),
      email: Value(email),
      fullName: Value(fullName),
      role: Value(role),
      tokenVersion: Value(tokenVersion),
      lastAuthAt: lastAuthAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastAuthAt),
    );
  }

  factory UsersLocalData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return UsersLocalData(
      id: serializer.fromJson<String>(json['id']),
      email: serializer.fromJson<String>(json['email']),
      fullName: serializer.fromJson<String>(json['fullName']),
      role: serializer.fromJson<String>(json['role']),
      tokenVersion: serializer.fromJson<int>(json['tokenVersion']),
      lastAuthAt: serializer.fromJson<int?>(json['lastAuthAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'email': serializer.toJson<String>(email),
      'fullName': serializer.toJson<String>(fullName),
      'role': serializer.toJson<String>(role),
      'tokenVersion': serializer.toJson<int>(tokenVersion),
      'lastAuthAt': serializer.toJson<int?>(lastAuthAt),
    };
  }

  UsersLocalData copyWith(
          {String? id,
          String? email,
          String? fullName,
          String? role,
          int? tokenVersion,
          Value<int?> lastAuthAt = const Value.absent()}) =>
      UsersLocalData(
        id: id ?? this.id,
        email: email ?? this.email,
        fullName: fullName ?? this.fullName,
        role: role ?? this.role,
        tokenVersion: tokenVersion ?? this.tokenVersion,
        lastAuthAt: lastAuthAt.present ? lastAuthAt.value : this.lastAuthAt,
      );
  UsersLocalData copyWithCompanion(UsersLocalCompanion data) {
    return UsersLocalData(
      id: data.id.present ? data.id.value : this.id,
      email: data.email.present ? data.email.value : this.email,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
      role: data.role.present ? data.role.value : this.role,
      tokenVersion: data.tokenVersion.present
          ? data.tokenVersion.value
          : this.tokenVersion,
      lastAuthAt:
          data.lastAuthAt.present ? data.lastAuthAt.value : this.lastAuthAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('UsersLocalData(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('fullName: $fullName, ')
          ..write('role: $role, ')
          ..write('tokenVersion: $tokenVersion, ')
          ..write('lastAuthAt: $lastAuthAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, email, fullName, role, tokenVersion, lastAuthAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is UsersLocalData &&
          other.id == this.id &&
          other.email == this.email &&
          other.fullName == this.fullName &&
          other.role == this.role &&
          other.tokenVersion == this.tokenVersion &&
          other.lastAuthAt == this.lastAuthAt);
}

class UsersLocalCompanion extends UpdateCompanion<UsersLocalData> {
  final Value<String> id;
  final Value<String> email;
  final Value<String> fullName;
  final Value<String> role;
  final Value<int> tokenVersion;
  final Value<int?> lastAuthAt;
  final Value<int> rowid;
  const UsersLocalCompanion({
    this.id = const Value.absent(),
    this.email = const Value.absent(),
    this.fullName = const Value.absent(),
    this.role = const Value.absent(),
    this.tokenVersion = const Value.absent(),
    this.lastAuthAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UsersLocalCompanion.insert({
    required String id,
    required String email,
    required String fullName,
    required String role,
    required int tokenVersion,
    this.lastAuthAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        email = Value(email),
        fullName = Value(fullName),
        role = Value(role),
        tokenVersion = Value(tokenVersion);
  static Insertable<UsersLocalData> custom({
    Expression<String>? id,
    Expression<String>? email,
    Expression<String>? fullName,
    Expression<String>? role,
    Expression<int>? tokenVersion,
    Expression<int>? lastAuthAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (email != null) 'email': email,
      if (fullName != null) 'full_name': fullName,
      if (role != null) 'role': role,
      if (tokenVersion != null) 'token_version': tokenVersion,
      if (lastAuthAt != null) 'last_auth_at': lastAuthAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UsersLocalCompanion copyWith(
      {Value<String>? id,
      Value<String>? email,
      Value<String>? fullName,
      Value<String>? role,
      Value<int>? tokenVersion,
      Value<int?>? lastAuthAt,
      Value<int>? rowid}) {
    return UsersLocalCompanion(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      tokenVersion: tokenVersion ?? this.tokenVersion,
      lastAuthAt: lastAuthAt ?? this.lastAuthAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (tokenVersion.present) {
      map['token_version'] = Variable<int>(tokenVersion.value);
    }
    if (lastAuthAt.present) {
      map['last_auth_at'] = Variable<int>(lastAuthAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UsersLocalCompanion(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('fullName: $fullName, ')
          ..write('role: $role, ')
          ..write('tokenVersion: $tokenVersion, ')
          ..write('lastAuthAt: $lastAuthAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ProjectsTable extends Projects with TableInfo<$ProjectsTable, Project> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProjectsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _codeMeta = const VerificationMeta('code');
  @override
  late final GeneratedColumn<String> code = GeneratedColumn<String>(
      'code', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _boundaryGeojsonMeta =
      const VerificationMeta('boundaryGeojson');
  @override
  late final GeneratedColumn<String> boundaryGeojson = GeneratedColumn<String>(
      'boundary_geojson', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _bboxGeojsonMeta =
      const VerificationMeta('bboxGeojson');
  @override
  late final GeneratedColumn<String> bboxGeojson = GeneratedColumn<String>(
      'bbox_geojson', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _isArchivedMeta =
      const VerificationMeta('isArchived');
  @override
  late final GeneratedColumn<int> isArchived = GeneratedColumn<int>(
      'is_archived', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _mapCacheStatusMeta =
      const VerificationMeta('mapCacheStatus');
  @override
  late final GeneratedColumn<String> mapCacheStatus = GeneratedColumn<String>(
      'map_cache_status', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _mapCacheBytesMeta =
      const VerificationMeta('mapCacheBytes');
  @override
  late final GeneratedColumn<int> mapCacheBytes = GeneratedColumn<int>(
      'map_cache_bytes', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _lastPulledAtMeta =
      const VerificationMeta('lastPulledAt');
  @override
  late final GeneratedColumn<String> lastPulledAt = GeneratedColumn<String>(
      'last_pulled_at', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _lastCursorUpdatedAtMeta =
      const VerificationMeta('lastCursorUpdatedAt');
  @override
  late final GeneratedColumn<String> lastCursorUpdatedAt =
      GeneratedColumn<String>('last_cursor_updated_at', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _lastCursorIdMeta =
      const VerificationMeta('lastCursorId');
  @override
  late final GeneratedColumn<String> lastCursorId = GeneratedColumn<String>(
      'last_cursor_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        code,
        description,
        boundaryGeojson,
        bboxGeojson,
        isArchived,
        updatedAt,
        mapCacheStatus,
        mapCacheBytes,
        lastPulledAt,
        lastCursorUpdatedAt,
        lastCursorId
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'projects';
  @override
  VerificationContext validateIntegrity(Insertable<Project> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('code')) {
      context.handle(
          _codeMeta, code.isAcceptableOrUnknown(data['code']!, _codeMeta));
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('boundary_geojson')) {
      context.handle(
          _boundaryGeojsonMeta,
          boundaryGeojson.isAcceptableOrUnknown(
              data['boundary_geojson']!, _boundaryGeojsonMeta));
    }
    if (data.containsKey('bbox_geojson')) {
      context.handle(
          _bboxGeojsonMeta,
          bboxGeojson.isAcceptableOrUnknown(
              data['bbox_geojson']!, _bboxGeojsonMeta));
    }
    if (data.containsKey('is_archived')) {
      context.handle(
          _isArchivedMeta,
          isArchived.isAcceptableOrUnknown(
              data['is_archived']!, _isArchivedMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('map_cache_status')) {
      context.handle(
          _mapCacheStatusMeta,
          mapCacheStatus.isAcceptableOrUnknown(
              data['map_cache_status']!, _mapCacheStatusMeta));
    }
    if (data.containsKey('map_cache_bytes')) {
      context.handle(
          _mapCacheBytesMeta,
          mapCacheBytes.isAcceptableOrUnknown(
              data['map_cache_bytes']!, _mapCacheBytesMeta));
    }
    if (data.containsKey('last_pulled_at')) {
      context.handle(
          _lastPulledAtMeta,
          lastPulledAt.isAcceptableOrUnknown(
              data['last_pulled_at']!, _lastPulledAtMeta));
    }
    if (data.containsKey('last_cursor_updated_at')) {
      context.handle(
          _lastCursorUpdatedAtMeta,
          lastCursorUpdatedAt.isAcceptableOrUnknown(
              data['last_cursor_updated_at']!, _lastCursorUpdatedAtMeta));
    }
    if (data.containsKey('last_cursor_id')) {
      context.handle(
          _lastCursorIdMeta,
          lastCursorId.isAcceptableOrUnknown(
              data['last_cursor_id']!, _lastCursorIdMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Project map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Project(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      code: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}code']),
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      boundaryGeojson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}boundary_geojson']),
      bboxGeojson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}bbox_geojson']),
      isArchived: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}is_archived'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
      mapCacheStatus: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}map_cache_status']),
      mapCacheBytes: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}map_cache_bytes']),
      lastPulledAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_pulled_at']),
      lastCursorUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}last_cursor_updated_at']),
      lastCursorId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_cursor_id']),
    );
  }

  @override
  $ProjectsTable createAlias(String alias) {
    return $ProjectsTable(attachedDatabase, alias);
  }
}

class Project extends DataClass implements Insertable<Project> {
  final String id;
  final String name;
  final String? code;
  final String? description;
  final String? boundaryGeojson;
  final String? bboxGeojson;
  final int isArchived;
  final String updatedAt;
  final String? mapCacheStatus;
  final int? mapCacheBytes;
  final String? lastPulledAt;
  final String? lastCursorUpdatedAt;
  final String? lastCursorId;
  const Project(
      {required this.id,
      required this.name,
      this.code,
      this.description,
      this.boundaryGeojson,
      this.bboxGeojson,
      required this.isArchived,
      required this.updatedAt,
      this.mapCacheStatus,
      this.mapCacheBytes,
      this.lastPulledAt,
      this.lastCursorUpdatedAt,
      this.lastCursorId});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || code != null) {
      map['code'] = Variable<String>(code);
    }
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    if (!nullToAbsent || boundaryGeojson != null) {
      map['boundary_geojson'] = Variable<String>(boundaryGeojson);
    }
    if (!nullToAbsent || bboxGeojson != null) {
      map['bbox_geojson'] = Variable<String>(bboxGeojson);
    }
    map['is_archived'] = Variable<int>(isArchived);
    map['updated_at'] = Variable<String>(updatedAt);
    if (!nullToAbsent || mapCacheStatus != null) {
      map['map_cache_status'] = Variable<String>(mapCacheStatus);
    }
    if (!nullToAbsent || mapCacheBytes != null) {
      map['map_cache_bytes'] = Variable<int>(mapCacheBytes);
    }
    if (!nullToAbsent || lastPulledAt != null) {
      map['last_pulled_at'] = Variable<String>(lastPulledAt);
    }
    if (!nullToAbsent || lastCursorUpdatedAt != null) {
      map['last_cursor_updated_at'] = Variable<String>(lastCursorUpdatedAt);
    }
    if (!nullToAbsent || lastCursorId != null) {
      map['last_cursor_id'] = Variable<String>(lastCursorId);
    }
    return map;
  }

  ProjectsCompanion toCompanion(bool nullToAbsent) {
    return ProjectsCompanion(
      id: Value(id),
      name: Value(name),
      code: code == null && nullToAbsent ? const Value.absent() : Value(code),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      boundaryGeojson: boundaryGeojson == null && nullToAbsent
          ? const Value.absent()
          : Value(boundaryGeojson),
      bboxGeojson: bboxGeojson == null && nullToAbsent
          ? const Value.absent()
          : Value(bboxGeojson),
      isArchived: Value(isArchived),
      updatedAt: Value(updatedAt),
      mapCacheStatus: mapCacheStatus == null && nullToAbsent
          ? const Value.absent()
          : Value(mapCacheStatus),
      mapCacheBytes: mapCacheBytes == null && nullToAbsent
          ? const Value.absent()
          : Value(mapCacheBytes),
      lastPulledAt: lastPulledAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastPulledAt),
      lastCursorUpdatedAt: lastCursorUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastCursorUpdatedAt),
      lastCursorId: lastCursorId == null && nullToAbsent
          ? const Value.absent()
          : Value(lastCursorId),
    );
  }

  factory Project.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Project(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      code: serializer.fromJson<String?>(json['code']),
      description: serializer.fromJson<String?>(json['description']),
      boundaryGeojson: serializer.fromJson<String?>(json['boundaryGeojson']),
      bboxGeojson: serializer.fromJson<String?>(json['bboxGeojson']),
      isArchived: serializer.fromJson<int>(json['isArchived']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
      mapCacheStatus: serializer.fromJson<String?>(json['mapCacheStatus']),
      mapCacheBytes: serializer.fromJson<int?>(json['mapCacheBytes']),
      lastPulledAt: serializer.fromJson<String?>(json['lastPulledAt']),
      lastCursorUpdatedAt:
          serializer.fromJson<String?>(json['lastCursorUpdatedAt']),
      lastCursorId: serializer.fromJson<String?>(json['lastCursorId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'code': serializer.toJson<String?>(code),
      'description': serializer.toJson<String?>(description),
      'boundaryGeojson': serializer.toJson<String?>(boundaryGeojson),
      'bboxGeojson': serializer.toJson<String?>(bboxGeojson),
      'isArchived': serializer.toJson<int>(isArchived),
      'updatedAt': serializer.toJson<String>(updatedAt),
      'mapCacheStatus': serializer.toJson<String?>(mapCacheStatus),
      'mapCacheBytes': serializer.toJson<int?>(mapCacheBytes),
      'lastPulledAt': serializer.toJson<String?>(lastPulledAt),
      'lastCursorUpdatedAt': serializer.toJson<String?>(lastCursorUpdatedAt),
      'lastCursorId': serializer.toJson<String?>(lastCursorId),
    };
  }

  Project copyWith(
          {String? id,
          String? name,
          Value<String?> code = const Value.absent(),
          Value<String?> description = const Value.absent(),
          Value<String?> boundaryGeojson = const Value.absent(),
          Value<String?> bboxGeojson = const Value.absent(),
          int? isArchived,
          String? updatedAt,
          Value<String?> mapCacheStatus = const Value.absent(),
          Value<int?> mapCacheBytes = const Value.absent(),
          Value<String?> lastPulledAt = const Value.absent(),
          Value<String?> lastCursorUpdatedAt = const Value.absent(),
          Value<String?> lastCursorId = const Value.absent()}) =>
      Project(
        id: id ?? this.id,
        name: name ?? this.name,
        code: code.present ? code.value : this.code,
        description: description.present ? description.value : this.description,
        boundaryGeojson: boundaryGeojson.present
            ? boundaryGeojson.value
            : this.boundaryGeojson,
        bboxGeojson: bboxGeojson.present ? bboxGeojson.value : this.bboxGeojson,
        isArchived: isArchived ?? this.isArchived,
        updatedAt: updatedAt ?? this.updatedAt,
        mapCacheStatus:
            mapCacheStatus.present ? mapCacheStatus.value : this.mapCacheStatus,
        mapCacheBytes:
            mapCacheBytes.present ? mapCacheBytes.value : this.mapCacheBytes,
        lastPulledAt:
            lastPulledAt.present ? lastPulledAt.value : this.lastPulledAt,
        lastCursorUpdatedAt: lastCursorUpdatedAt.present
            ? lastCursorUpdatedAt.value
            : this.lastCursorUpdatedAt,
        lastCursorId:
            lastCursorId.present ? lastCursorId.value : this.lastCursorId,
      );
  Project copyWithCompanion(ProjectsCompanion data) {
    return Project(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      code: data.code.present ? data.code.value : this.code,
      description:
          data.description.present ? data.description.value : this.description,
      boundaryGeojson: data.boundaryGeojson.present
          ? data.boundaryGeojson.value
          : this.boundaryGeojson,
      bboxGeojson:
          data.bboxGeojson.present ? data.bboxGeojson.value : this.bboxGeojson,
      isArchived:
          data.isArchived.present ? data.isArchived.value : this.isArchived,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      mapCacheStatus: data.mapCacheStatus.present
          ? data.mapCacheStatus.value
          : this.mapCacheStatus,
      mapCacheBytes: data.mapCacheBytes.present
          ? data.mapCacheBytes.value
          : this.mapCacheBytes,
      lastPulledAt: data.lastPulledAt.present
          ? data.lastPulledAt.value
          : this.lastPulledAt,
      lastCursorUpdatedAt: data.lastCursorUpdatedAt.present
          ? data.lastCursorUpdatedAt.value
          : this.lastCursorUpdatedAt,
      lastCursorId: data.lastCursorId.present
          ? data.lastCursorId.value
          : this.lastCursorId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Project(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('code: $code, ')
          ..write('description: $description, ')
          ..write('boundaryGeojson: $boundaryGeojson, ')
          ..write('bboxGeojson: $bboxGeojson, ')
          ..write('isArchived: $isArchived, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('mapCacheStatus: $mapCacheStatus, ')
          ..write('mapCacheBytes: $mapCacheBytes, ')
          ..write('lastPulledAt: $lastPulledAt, ')
          ..write('lastCursorUpdatedAt: $lastCursorUpdatedAt, ')
          ..write('lastCursorId: $lastCursorId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      name,
      code,
      description,
      boundaryGeojson,
      bboxGeojson,
      isArchived,
      updatedAt,
      mapCacheStatus,
      mapCacheBytes,
      lastPulledAt,
      lastCursorUpdatedAt,
      lastCursorId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Project &&
          other.id == this.id &&
          other.name == this.name &&
          other.code == this.code &&
          other.description == this.description &&
          other.boundaryGeojson == this.boundaryGeojson &&
          other.bboxGeojson == this.bboxGeojson &&
          other.isArchived == this.isArchived &&
          other.updatedAt == this.updatedAt &&
          other.mapCacheStatus == this.mapCacheStatus &&
          other.mapCacheBytes == this.mapCacheBytes &&
          other.lastPulledAt == this.lastPulledAt &&
          other.lastCursorUpdatedAt == this.lastCursorUpdatedAt &&
          other.lastCursorId == this.lastCursorId);
}

class ProjectsCompanion extends UpdateCompanion<Project> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> code;
  final Value<String?> description;
  final Value<String?> boundaryGeojson;
  final Value<String?> bboxGeojson;
  final Value<int> isArchived;
  final Value<String> updatedAt;
  final Value<String?> mapCacheStatus;
  final Value<int?> mapCacheBytes;
  final Value<String?> lastPulledAt;
  final Value<String?> lastCursorUpdatedAt;
  final Value<String?> lastCursorId;
  final Value<int> rowid;
  const ProjectsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.code = const Value.absent(),
    this.description = const Value.absent(),
    this.boundaryGeojson = const Value.absent(),
    this.bboxGeojson = const Value.absent(),
    this.isArchived = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.mapCacheStatus = const Value.absent(),
    this.mapCacheBytes = const Value.absent(),
    this.lastPulledAt = const Value.absent(),
    this.lastCursorUpdatedAt = const Value.absent(),
    this.lastCursorId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProjectsCompanion.insert({
    required String id,
    required String name,
    this.code = const Value.absent(),
    this.description = const Value.absent(),
    this.boundaryGeojson = const Value.absent(),
    this.bboxGeojson = const Value.absent(),
    this.isArchived = const Value.absent(),
    required String updatedAt,
    this.mapCacheStatus = const Value.absent(),
    this.mapCacheBytes = const Value.absent(),
    this.lastPulledAt = const Value.absent(),
    this.lastCursorUpdatedAt = const Value.absent(),
    this.lastCursorId = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        updatedAt = Value(updatedAt);
  static Insertable<Project> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? code,
    Expression<String>? description,
    Expression<String>? boundaryGeojson,
    Expression<String>? bboxGeojson,
    Expression<int>? isArchived,
    Expression<String>? updatedAt,
    Expression<String>? mapCacheStatus,
    Expression<int>? mapCacheBytes,
    Expression<String>? lastPulledAt,
    Expression<String>? lastCursorUpdatedAt,
    Expression<String>? lastCursorId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (code != null) 'code': code,
      if (description != null) 'description': description,
      if (boundaryGeojson != null) 'boundary_geojson': boundaryGeojson,
      if (bboxGeojson != null) 'bbox_geojson': bboxGeojson,
      if (isArchived != null) 'is_archived': isArchived,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (mapCacheStatus != null) 'map_cache_status': mapCacheStatus,
      if (mapCacheBytes != null) 'map_cache_bytes': mapCacheBytes,
      if (lastPulledAt != null) 'last_pulled_at': lastPulledAt,
      if (lastCursorUpdatedAt != null)
        'last_cursor_updated_at': lastCursorUpdatedAt,
      if (lastCursorId != null) 'last_cursor_id': lastCursorId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProjectsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String?>? code,
      Value<String?>? description,
      Value<String?>? boundaryGeojson,
      Value<String?>? bboxGeojson,
      Value<int>? isArchived,
      Value<String>? updatedAt,
      Value<String?>? mapCacheStatus,
      Value<int?>? mapCacheBytes,
      Value<String?>? lastPulledAt,
      Value<String?>? lastCursorUpdatedAt,
      Value<String?>? lastCursorId,
      Value<int>? rowid}) {
    return ProjectsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      description: description ?? this.description,
      boundaryGeojson: boundaryGeojson ?? this.boundaryGeojson,
      bboxGeojson: bboxGeojson ?? this.bboxGeojson,
      isArchived: isArchived ?? this.isArchived,
      updatedAt: updatedAt ?? this.updatedAt,
      mapCacheStatus: mapCacheStatus ?? this.mapCacheStatus,
      mapCacheBytes: mapCacheBytes ?? this.mapCacheBytes,
      lastPulledAt: lastPulledAt ?? this.lastPulledAt,
      lastCursorUpdatedAt: lastCursorUpdatedAt ?? this.lastCursorUpdatedAt,
      lastCursorId: lastCursorId ?? this.lastCursorId,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (code.present) {
      map['code'] = Variable<String>(code.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (boundaryGeojson.present) {
      map['boundary_geojson'] = Variable<String>(boundaryGeojson.value);
    }
    if (bboxGeojson.present) {
      map['bbox_geojson'] = Variable<String>(bboxGeojson.value);
    }
    if (isArchived.present) {
      map['is_archived'] = Variable<int>(isArchived.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (mapCacheStatus.present) {
      map['map_cache_status'] = Variable<String>(mapCacheStatus.value);
    }
    if (mapCacheBytes.present) {
      map['map_cache_bytes'] = Variable<int>(mapCacheBytes.value);
    }
    if (lastPulledAt.present) {
      map['last_pulled_at'] = Variable<String>(lastPulledAt.value);
    }
    if (lastCursorUpdatedAt.present) {
      map['last_cursor_updated_at'] =
          Variable<String>(lastCursorUpdatedAt.value);
    }
    if (lastCursorId.present) {
      map['last_cursor_id'] = Variable<String>(lastCursorId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProjectsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('code: $code, ')
          ..write('description: $description, ')
          ..write('boundaryGeojson: $boundaryGeojson, ')
          ..write('bboxGeojson: $bboxGeojson, ')
          ..write('isArchived: $isArchived, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('mapCacheStatus: $mapCacheStatus, ')
          ..write('mapCacheBytes: $mapCacheBytes, ')
          ..write('lastPulledAt: $lastPulledAt, ')
          ..write('lastCursorUpdatedAt: $lastCursorUpdatedAt, ')
          ..write('lastCursorId: $lastCursorId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $InspectionPointsTable extends InspectionPoints
    with TableInfo<$InspectionPointsTable, InspectionPoint> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $InspectionPointsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _clientUuidMeta =
      const VerificationMeta('clientUuid');
  @override
  late final GeneratedColumn<String> clientUuid = GeneratedColumn<String>(
      'client_uuid', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _serverIdMeta =
      const VerificationMeta('serverId');
  @override
  late final GeneratedColumn<String> serverId = GeneratedColumn<String>(
      'server_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
      'note', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _remarksMeta =
      const VerificationMeta('remarks');
  @override
  late final GeneratedColumn<String> remarks = GeneratedColumn<String>(
      'remarks', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _recommendedProcedureMeta =
      const VerificationMeta('recommendedProcedure');
  @override
  late final GeneratedColumn<String> recommendedProcedure =
      GeneratedColumn<String>('recommended_procedure', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('open'));
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _accuracyMMeta =
      const VerificationMeta('accuracyM');
  @override
  late final GeneratedColumn<double> accuracyM = GeneratedColumn<double>(
      'accuracy_m', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _altitudeMMeta =
      const VerificationMeta('altitudeM');
  @override
  late final GeneratedColumn<double> altitudeM = GeneratedColumn<double>(
      'altitude_m', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _headingDegMeta =
      const VerificationMeta('headingDeg');
  @override
  late final GeneratedColumn<double> headingDeg = GeneratedColumn<double>(
      'heading_deg', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _locationSourceMeta =
      const VerificationMeta('locationSource');
  @override
  late final GeneratedColumn<String> locationSource = GeneratedColumn<String>(
      'location_source', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _locationAdjustedMeta =
      const VerificationMeta('locationAdjusted');
  @override
  late final GeneratedColumn<int> locationAdjusted = GeneratedColumn<int>(
      'location_adjusted', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _outsideBoundaryMeta =
      const VerificationMeta('outsideBoundary');
  @override
  late final GeneratedColumn<int> outsideBoundary = GeneratedColumn<int>(
      'outside_boundary', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _capturedAtMeta =
      const VerificationMeta('capturedAt');
  @override
  late final GeneratedColumn<String> capturedAt = GeneratedColumn<String>(
      'captured_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _clientDeviceInfoMeta =
      const VerificationMeta('clientDeviceInfo');
  @override
  late final GeneratedColumn<String> clientDeviceInfo = GeneratedColumn<String>(
      'client_device_info', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _versionMeta =
      const VerificationMeta('version');
  @override
  late final GeneratedColumn<int> version = GeneratedColumn<int>(
      'version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
      'sync_status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastErrorMeta =
      const VerificationMeta('lastError');
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
      'last_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
      'created_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        clientUuid,
        serverId,
        projectId,
        category,
        note,
        remarks,
        recommendedProcedure,
        status,
        latitude,
        longitude,
        accuracyM,
        altitudeM,
        headingDeg,
        locationSource,
        locationAdjusted,
        outsideBoundary,
        capturedAt,
        clientDeviceInfo,
        version,
        syncStatus,
        lastError,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'inspection_points';
  @override
  VerificationContext validateIntegrity(Insertable<InspectionPoint> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('client_uuid')) {
      context.handle(
          _clientUuidMeta,
          clientUuid.isAcceptableOrUnknown(
              data['client_uuid']!, _clientUuidMeta));
    } else if (isInserting) {
      context.missing(_clientUuidMeta);
    }
    if (data.containsKey('server_id')) {
      context.handle(_serverIdMeta,
          serverId.isAcceptableOrUnknown(data['server_id']!, _serverIdMeta));
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    } else if (isInserting) {
      context.missing(_categoryMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
          _noteMeta, note.isAcceptableOrUnknown(data['note']!, _noteMeta));
    }
    if (data.containsKey('remarks')) {
      context.handle(_remarksMeta,
          remarks.isAcceptableOrUnknown(data['remarks']!, _remarksMeta));
    }
    if (data.containsKey('recommended_procedure')) {
      context.handle(
          _recommendedProcedureMeta,
          recommendedProcedure.isAcceptableOrUnknown(
              data['recommended_procedure']!, _recommendedProcedureMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('accuracy_m')) {
      context.handle(_accuracyMMeta,
          accuracyM.isAcceptableOrUnknown(data['accuracy_m']!, _accuracyMMeta));
    }
    if (data.containsKey('altitude_m')) {
      context.handle(_altitudeMMeta,
          altitudeM.isAcceptableOrUnknown(data['altitude_m']!, _altitudeMMeta));
    }
    if (data.containsKey('heading_deg')) {
      context.handle(
          _headingDegMeta,
          headingDeg.isAcceptableOrUnknown(
              data['heading_deg']!, _headingDegMeta));
    }
    if (data.containsKey('location_source')) {
      context.handle(
          _locationSourceMeta,
          locationSource.isAcceptableOrUnknown(
              data['location_source']!, _locationSourceMeta));
    }
    if (data.containsKey('location_adjusted')) {
      context.handle(
          _locationAdjustedMeta,
          locationAdjusted.isAcceptableOrUnknown(
              data['location_adjusted']!, _locationAdjustedMeta));
    }
    if (data.containsKey('outside_boundary')) {
      context.handle(
          _outsideBoundaryMeta,
          outsideBoundary.isAcceptableOrUnknown(
              data['outside_boundary']!, _outsideBoundaryMeta));
    }
    if (data.containsKey('captured_at')) {
      context.handle(
          _capturedAtMeta,
          capturedAt.isAcceptableOrUnknown(
              data['captured_at']!, _capturedAtMeta));
    } else if (isInserting) {
      context.missing(_capturedAtMeta);
    }
    if (data.containsKey('client_device_info')) {
      context.handle(
          _clientDeviceInfoMeta,
          clientDeviceInfo.isAcceptableOrUnknown(
              data['client_device_info']!, _clientDeviceInfoMeta));
    }
    if (data.containsKey('version')) {
      context.handle(_versionMeta,
          version.isAcceptableOrUnknown(data['version']!, _versionMeta));
    }
    if (data.containsKey('sync_status')) {
      context.handle(
          _syncStatusMeta,
          syncStatus.isAcceptableOrUnknown(
              data['sync_status']!, _syncStatusMeta));
    } else if (isInserting) {
      context.missing(_syncStatusMeta);
    }
    if (data.containsKey('last_error')) {
      context.handle(_lastErrorMeta,
          lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {clientUuid};
  @override
  InspectionPoint map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return InspectionPoint(
      clientUuid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}client_uuid'])!,
      serverId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}server_id']),
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category'])!,
      note: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}note']),
      remarks: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remarks']),
      recommendedProcedure: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}recommended_procedure']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude'])!,
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude'])!,
      accuracyM: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}accuracy_m']),
      altitudeM: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}altitude_m']),
      headingDeg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}heading_deg']),
      locationSource: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}location_source']),
      locationAdjusted: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}location_adjusted'])!,
      outsideBoundary: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}outside_boundary'])!,
      capturedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}captured_at'])!,
      clientDeviceInfo: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}client_device_info']),
      version: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}version'])!,
      syncStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sync_status'])!,
      lastError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_error']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $InspectionPointsTable createAlias(String alias) {
    return $InspectionPointsTable(attachedDatabase, alias);
  }
}

class InspectionPoint extends DataClass implements Insertable<InspectionPoint> {
  final String clientUuid;
  final String? serverId;
  final String projectId;
  final String category;
  final String? note;
  final String? remarks;
  final String? recommendedProcedure;
  final String status;
  final double latitude;
  final double longitude;
  final double? accuracyM;
  final double? altitudeM;
  final double? headingDeg;
  final String? locationSource;
  final int locationAdjusted;
  final int outsideBoundary;
  final String capturedAt;
  final String? clientDeviceInfo;
  final int version;
  final String syncStatus;
  final String? lastError;
  final String createdAt;
  final String updatedAt;
  const InspectionPoint(
      {required this.clientUuid,
      this.serverId,
      required this.projectId,
      required this.category,
      this.note,
      this.remarks,
      this.recommendedProcedure,
      required this.status,
      required this.latitude,
      required this.longitude,
      this.accuracyM,
      this.altitudeM,
      this.headingDeg,
      this.locationSource,
      required this.locationAdjusted,
      required this.outsideBoundary,
      required this.capturedAt,
      this.clientDeviceInfo,
      required this.version,
      required this.syncStatus,
      this.lastError,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['client_uuid'] = Variable<String>(clientUuid);
    if (!nullToAbsent || serverId != null) {
      map['server_id'] = Variable<String>(serverId);
    }
    map['project_id'] = Variable<String>(projectId);
    map['category'] = Variable<String>(category);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    if (!nullToAbsent || remarks != null) {
      map['remarks'] = Variable<String>(remarks);
    }
    if (!nullToAbsent || recommendedProcedure != null) {
      map['recommended_procedure'] = Variable<String>(recommendedProcedure);
    }
    map['status'] = Variable<String>(status);
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    if (!nullToAbsent || accuracyM != null) {
      map['accuracy_m'] = Variable<double>(accuracyM);
    }
    if (!nullToAbsent || altitudeM != null) {
      map['altitude_m'] = Variable<double>(altitudeM);
    }
    if (!nullToAbsent || headingDeg != null) {
      map['heading_deg'] = Variable<double>(headingDeg);
    }
    if (!nullToAbsent || locationSource != null) {
      map['location_source'] = Variable<String>(locationSource);
    }
    map['location_adjusted'] = Variable<int>(locationAdjusted);
    map['outside_boundary'] = Variable<int>(outsideBoundary);
    map['captured_at'] = Variable<String>(capturedAt);
    if (!nullToAbsent || clientDeviceInfo != null) {
      map['client_device_info'] = Variable<String>(clientDeviceInfo);
    }
    map['version'] = Variable<int>(version);
    map['sync_status'] = Variable<String>(syncStatus);
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  InspectionPointsCompanion toCompanion(bool nullToAbsent) {
    return InspectionPointsCompanion(
      clientUuid: Value(clientUuid),
      serverId: serverId == null && nullToAbsent
          ? const Value.absent()
          : Value(serverId),
      projectId: Value(projectId),
      category: Value(category),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      remarks: remarks == null && nullToAbsent
          ? const Value.absent()
          : Value(remarks),
      recommendedProcedure: recommendedProcedure == null && nullToAbsent
          ? const Value.absent()
          : Value(recommendedProcedure),
      status: Value(status),
      latitude: Value(latitude),
      longitude: Value(longitude),
      accuracyM: accuracyM == null && nullToAbsent
          ? const Value.absent()
          : Value(accuracyM),
      altitudeM: altitudeM == null && nullToAbsent
          ? const Value.absent()
          : Value(altitudeM),
      headingDeg: headingDeg == null && nullToAbsent
          ? const Value.absent()
          : Value(headingDeg),
      locationSource: locationSource == null && nullToAbsent
          ? const Value.absent()
          : Value(locationSource),
      locationAdjusted: Value(locationAdjusted),
      outsideBoundary: Value(outsideBoundary),
      capturedAt: Value(capturedAt),
      clientDeviceInfo: clientDeviceInfo == null && nullToAbsent
          ? const Value.absent()
          : Value(clientDeviceInfo),
      version: Value(version),
      syncStatus: Value(syncStatus),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory InspectionPoint.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return InspectionPoint(
      clientUuid: serializer.fromJson<String>(json['clientUuid']),
      serverId: serializer.fromJson<String?>(json['serverId']),
      projectId: serializer.fromJson<String>(json['projectId']),
      category: serializer.fromJson<String>(json['category']),
      note: serializer.fromJson<String?>(json['note']),
      remarks: serializer.fromJson<String?>(json['remarks']),
      recommendedProcedure:
          serializer.fromJson<String?>(json['recommendedProcedure']),
      status: serializer.fromJson<String>(json['status']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      accuracyM: serializer.fromJson<double?>(json['accuracyM']),
      altitudeM: serializer.fromJson<double?>(json['altitudeM']),
      headingDeg: serializer.fromJson<double?>(json['headingDeg']),
      locationSource: serializer.fromJson<String?>(json['locationSource']),
      locationAdjusted: serializer.fromJson<int>(json['locationAdjusted']),
      outsideBoundary: serializer.fromJson<int>(json['outsideBoundary']),
      capturedAt: serializer.fromJson<String>(json['capturedAt']),
      clientDeviceInfo: serializer.fromJson<String?>(json['clientDeviceInfo']),
      version: serializer.fromJson<int>(json['version']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      lastError: serializer.fromJson<String?>(json['lastError']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'clientUuid': serializer.toJson<String>(clientUuid),
      'serverId': serializer.toJson<String?>(serverId),
      'projectId': serializer.toJson<String>(projectId),
      'category': serializer.toJson<String>(category),
      'note': serializer.toJson<String?>(note),
      'remarks': serializer.toJson<String?>(remarks),
      'recommendedProcedure': serializer.toJson<String?>(recommendedProcedure),
      'status': serializer.toJson<String>(status),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'accuracyM': serializer.toJson<double?>(accuracyM),
      'altitudeM': serializer.toJson<double?>(altitudeM),
      'headingDeg': serializer.toJson<double?>(headingDeg),
      'locationSource': serializer.toJson<String?>(locationSource),
      'locationAdjusted': serializer.toJson<int>(locationAdjusted),
      'outsideBoundary': serializer.toJson<int>(outsideBoundary),
      'capturedAt': serializer.toJson<String>(capturedAt),
      'clientDeviceInfo': serializer.toJson<String?>(clientDeviceInfo),
      'version': serializer.toJson<int>(version),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'lastError': serializer.toJson<String?>(lastError),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  InspectionPoint copyWith(
          {String? clientUuid,
          Value<String?> serverId = const Value.absent(),
          String? projectId,
          String? category,
          Value<String?> note = const Value.absent(),
          Value<String?> remarks = const Value.absent(),
          Value<String?> recommendedProcedure = const Value.absent(),
          String? status,
          double? latitude,
          double? longitude,
          Value<double?> accuracyM = const Value.absent(),
          Value<double?> altitudeM = const Value.absent(),
          Value<double?> headingDeg = const Value.absent(),
          Value<String?> locationSource = const Value.absent(),
          int? locationAdjusted,
          int? outsideBoundary,
          String? capturedAt,
          Value<String?> clientDeviceInfo = const Value.absent(),
          int? version,
          String? syncStatus,
          Value<String?> lastError = const Value.absent(),
          String? createdAt,
          String? updatedAt}) =>
      InspectionPoint(
        clientUuid: clientUuid ?? this.clientUuid,
        serverId: serverId.present ? serverId.value : this.serverId,
        projectId: projectId ?? this.projectId,
        category: category ?? this.category,
        note: note.present ? note.value : this.note,
        remarks: remarks.present ? remarks.value : this.remarks,
        recommendedProcedure: recommendedProcedure.present
            ? recommendedProcedure.value
            : this.recommendedProcedure,
        status: status ?? this.status,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        accuracyM: accuracyM.present ? accuracyM.value : this.accuracyM,
        altitudeM: altitudeM.present ? altitudeM.value : this.altitudeM,
        headingDeg: headingDeg.present ? headingDeg.value : this.headingDeg,
        locationSource:
            locationSource.present ? locationSource.value : this.locationSource,
        locationAdjusted: locationAdjusted ?? this.locationAdjusted,
        outsideBoundary: outsideBoundary ?? this.outsideBoundary,
        capturedAt: capturedAt ?? this.capturedAt,
        clientDeviceInfo: clientDeviceInfo.present
            ? clientDeviceInfo.value
            : this.clientDeviceInfo,
        version: version ?? this.version,
        syncStatus: syncStatus ?? this.syncStatus,
        lastError: lastError.present ? lastError.value : this.lastError,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  InspectionPoint copyWithCompanion(InspectionPointsCompanion data) {
    return InspectionPoint(
      clientUuid:
          data.clientUuid.present ? data.clientUuid.value : this.clientUuid,
      serverId: data.serverId.present ? data.serverId.value : this.serverId,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      category: data.category.present ? data.category.value : this.category,
      note: data.note.present ? data.note.value : this.note,
      remarks: data.remarks.present ? data.remarks.value : this.remarks,
      recommendedProcedure: data.recommendedProcedure.present
          ? data.recommendedProcedure.value
          : this.recommendedProcedure,
      status: data.status.present ? data.status.value : this.status,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      accuracyM: data.accuracyM.present ? data.accuracyM.value : this.accuracyM,
      altitudeM: data.altitudeM.present ? data.altitudeM.value : this.altitudeM,
      headingDeg:
          data.headingDeg.present ? data.headingDeg.value : this.headingDeg,
      locationSource: data.locationSource.present
          ? data.locationSource.value
          : this.locationSource,
      locationAdjusted: data.locationAdjusted.present
          ? data.locationAdjusted.value
          : this.locationAdjusted,
      outsideBoundary: data.outsideBoundary.present
          ? data.outsideBoundary.value
          : this.outsideBoundary,
      capturedAt:
          data.capturedAt.present ? data.capturedAt.value : this.capturedAt,
      clientDeviceInfo: data.clientDeviceInfo.present
          ? data.clientDeviceInfo.value
          : this.clientDeviceInfo,
      version: data.version.present ? data.version.value : this.version,
      syncStatus:
          data.syncStatus.present ? data.syncStatus.value : this.syncStatus,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('InspectionPoint(')
          ..write('clientUuid: $clientUuid, ')
          ..write('serverId: $serverId, ')
          ..write('projectId: $projectId, ')
          ..write('category: $category, ')
          ..write('note: $note, ')
          ..write('remarks: $remarks, ')
          ..write('recommendedProcedure: $recommendedProcedure, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('accuracyM: $accuracyM, ')
          ..write('altitudeM: $altitudeM, ')
          ..write('headingDeg: $headingDeg, ')
          ..write('locationSource: $locationSource, ')
          ..write('locationAdjusted: $locationAdjusted, ')
          ..write('outsideBoundary: $outsideBoundary, ')
          ..write('capturedAt: $capturedAt, ')
          ..write('clientDeviceInfo: $clientDeviceInfo, ')
          ..write('version: $version, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        clientUuid,
        serverId,
        projectId,
        category,
        note,
        remarks,
        recommendedProcedure,
        status,
        latitude,
        longitude,
        accuracyM,
        altitudeM,
        headingDeg,
        locationSource,
        locationAdjusted,
        outsideBoundary,
        capturedAt,
        clientDeviceInfo,
        version,
        syncStatus,
        lastError,
        createdAt,
        updatedAt
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is InspectionPoint &&
          other.clientUuid == this.clientUuid &&
          other.serverId == this.serverId &&
          other.projectId == this.projectId &&
          other.category == this.category &&
          other.note == this.note &&
          other.remarks == this.remarks &&
          other.recommendedProcedure == this.recommendedProcedure &&
          other.status == this.status &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.accuracyM == this.accuracyM &&
          other.altitudeM == this.altitudeM &&
          other.headingDeg == this.headingDeg &&
          other.locationSource == this.locationSource &&
          other.locationAdjusted == this.locationAdjusted &&
          other.outsideBoundary == this.outsideBoundary &&
          other.capturedAt == this.capturedAt &&
          other.clientDeviceInfo == this.clientDeviceInfo &&
          other.version == this.version &&
          other.syncStatus == this.syncStatus &&
          other.lastError == this.lastError &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class InspectionPointsCompanion extends UpdateCompanion<InspectionPoint> {
  final Value<String> clientUuid;
  final Value<String?> serverId;
  final Value<String> projectId;
  final Value<String> category;
  final Value<String?> note;
  final Value<String?> remarks;
  final Value<String?> recommendedProcedure;
  final Value<String> status;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<double?> accuracyM;
  final Value<double?> altitudeM;
  final Value<double?> headingDeg;
  final Value<String?> locationSource;
  final Value<int> locationAdjusted;
  final Value<int> outsideBoundary;
  final Value<String> capturedAt;
  final Value<String?> clientDeviceInfo;
  final Value<int> version;
  final Value<String> syncStatus;
  final Value<String?> lastError;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const InspectionPointsCompanion({
    this.clientUuid = const Value.absent(),
    this.serverId = const Value.absent(),
    this.projectId = const Value.absent(),
    this.category = const Value.absent(),
    this.note = const Value.absent(),
    this.remarks = const Value.absent(),
    this.recommendedProcedure = const Value.absent(),
    this.status = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.accuracyM = const Value.absent(),
    this.altitudeM = const Value.absent(),
    this.headingDeg = const Value.absent(),
    this.locationSource = const Value.absent(),
    this.locationAdjusted = const Value.absent(),
    this.outsideBoundary = const Value.absent(),
    this.capturedAt = const Value.absent(),
    this.clientDeviceInfo = const Value.absent(),
    this.version = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.lastError = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  InspectionPointsCompanion.insert({
    required String clientUuid,
    this.serverId = const Value.absent(),
    required String projectId,
    required String category,
    this.note = const Value.absent(),
    this.remarks = const Value.absent(),
    this.recommendedProcedure = const Value.absent(),
    this.status = const Value.absent(),
    required double latitude,
    required double longitude,
    this.accuracyM = const Value.absent(),
    this.altitudeM = const Value.absent(),
    this.headingDeg = const Value.absent(),
    this.locationSource = const Value.absent(),
    this.locationAdjusted = const Value.absent(),
    this.outsideBoundary = const Value.absent(),
    required String capturedAt,
    this.clientDeviceInfo = const Value.absent(),
    this.version = const Value.absent(),
    required String syncStatus,
    this.lastError = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  })  : clientUuid = Value(clientUuid),
        projectId = Value(projectId),
        category = Value(category),
        latitude = Value(latitude),
        longitude = Value(longitude),
        capturedAt = Value(capturedAt),
        syncStatus = Value(syncStatus),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<InspectionPoint> custom({
    Expression<String>? clientUuid,
    Expression<String>? serverId,
    Expression<String>? projectId,
    Expression<String>? category,
    Expression<String>? note,
    Expression<String>? remarks,
    Expression<String>? recommendedProcedure,
    Expression<String>? status,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<double>? accuracyM,
    Expression<double>? altitudeM,
    Expression<double>? headingDeg,
    Expression<String>? locationSource,
    Expression<int>? locationAdjusted,
    Expression<int>? outsideBoundary,
    Expression<String>? capturedAt,
    Expression<String>? clientDeviceInfo,
    Expression<int>? version,
    Expression<String>? syncStatus,
    Expression<String>? lastError,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (clientUuid != null) 'client_uuid': clientUuid,
      if (serverId != null) 'server_id': serverId,
      if (projectId != null) 'project_id': projectId,
      if (category != null) 'category': category,
      if (note != null) 'note': note,
      if (remarks != null) 'remarks': remarks,
      if (recommendedProcedure != null)
        'recommended_procedure': recommendedProcedure,
      if (status != null) 'status': status,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (accuracyM != null) 'accuracy_m': accuracyM,
      if (altitudeM != null) 'altitude_m': altitudeM,
      if (headingDeg != null) 'heading_deg': headingDeg,
      if (locationSource != null) 'location_source': locationSource,
      if (locationAdjusted != null) 'location_adjusted': locationAdjusted,
      if (outsideBoundary != null) 'outside_boundary': outsideBoundary,
      if (capturedAt != null) 'captured_at': capturedAt,
      if (clientDeviceInfo != null) 'client_device_info': clientDeviceInfo,
      if (version != null) 'version': version,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (lastError != null) 'last_error': lastError,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  InspectionPointsCompanion copyWith(
      {Value<String>? clientUuid,
      Value<String?>? serverId,
      Value<String>? projectId,
      Value<String>? category,
      Value<String?>? note,
      Value<String?>? remarks,
      Value<String?>? recommendedProcedure,
      Value<String>? status,
      Value<double>? latitude,
      Value<double>? longitude,
      Value<double?>? accuracyM,
      Value<double?>? altitudeM,
      Value<double?>? headingDeg,
      Value<String?>? locationSource,
      Value<int>? locationAdjusted,
      Value<int>? outsideBoundary,
      Value<String>? capturedAt,
      Value<String?>? clientDeviceInfo,
      Value<int>? version,
      Value<String>? syncStatus,
      Value<String?>? lastError,
      Value<String>? createdAt,
      Value<String>? updatedAt,
      Value<int>? rowid}) {
    return InspectionPointsCompanion(
      clientUuid: clientUuid ?? this.clientUuid,
      serverId: serverId ?? this.serverId,
      projectId: projectId ?? this.projectId,
      category: category ?? this.category,
      note: note ?? this.note,
      remarks: remarks ?? this.remarks,
      recommendedProcedure: recommendedProcedure ?? this.recommendedProcedure,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracyM: accuracyM ?? this.accuracyM,
      altitudeM: altitudeM ?? this.altitudeM,
      headingDeg: headingDeg ?? this.headingDeg,
      locationSource: locationSource ?? this.locationSource,
      locationAdjusted: locationAdjusted ?? this.locationAdjusted,
      outsideBoundary: outsideBoundary ?? this.outsideBoundary,
      capturedAt: capturedAt ?? this.capturedAt,
      clientDeviceInfo: clientDeviceInfo ?? this.clientDeviceInfo,
      version: version ?? this.version,
      syncStatus: syncStatus ?? this.syncStatus,
      lastError: lastError ?? this.lastError,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (clientUuid.present) {
      map['client_uuid'] = Variable<String>(clientUuid.value);
    }
    if (serverId.present) {
      map['server_id'] = Variable<String>(serverId.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (remarks.present) {
      map['remarks'] = Variable<String>(remarks.value);
    }
    if (recommendedProcedure.present) {
      map['recommended_procedure'] =
          Variable<String>(recommendedProcedure.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (accuracyM.present) {
      map['accuracy_m'] = Variable<double>(accuracyM.value);
    }
    if (altitudeM.present) {
      map['altitude_m'] = Variable<double>(altitudeM.value);
    }
    if (headingDeg.present) {
      map['heading_deg'] = Variable<double>(headingDeg.value);
    }
    if (locationSource.present) {
      map['location_source'] = Variable<String>(locationSource.value);
    }
    if (locationAdjusted.present) {
      map['location_adjusted'] = Variable<int>(locationAdjusted.value);
    }
    if (outsideBoundary.present) {
      map['outside_boundary'] = Variable<int>(outsideBoundary.value);
    }
    if (capturedAt.present) {
      map['captured_at'] = Variable<String>(capturedAt.value);
    }
    if (clientDeviceInfo.present) {
      map['client_device_info'] = Variable<String>(clientDeviceInfo.value);
    }
    if (version.present) {
      map['version'] = Variable<int>(version.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('InspectionPointsCompanion(')
          ..write('clientUuid: $clientUuid, ')
          ..write('serverId: $serverId, ')
          ..write('projectId: $projectId, ')
          ..write('category: $category, ')
          ..write('note: $note, ')
          ..write('remarks: $remarks, ')
          ..write('recommendedProcedure: $recommendedProcedure, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('accuracyM: $accuracyM, ')
          ..write('altitudeM: $altitudeM, ')
          ..write('headingDeg: $headingDeg, ')
          ..write('locationSource: $locationSource, ')
          ..write('locationAdjusted: $locationAdjusted, ')
          ..write('outsideBoundary: $outsideBoundary, ')
          ..write('capturedAt: $capturedAt, ')
          ..write('clientDeviceInfo: $clientDeviceInfo, ')
          ..write('version: $version, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $PhotosTable extends Photos with TableInfo<$PhotosTable, Photo> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PhotosTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _clientUuidMeta =
      const VerificationMeta('clientUuid');
  @override
  late final GeneratedColumn<String> clientUuid = GeneratedColumn<String>(
      'client_uuid', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _serverIdMeta =
      const VerificationMeta('serverId');
  @override
  late final GeneratedColumn<String> serverId = GeneratedColumn<String>(
      'server_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _pointClientUuidMeta =
      const VerificationMeta('pointClientUuid');
  @override
  late final GeneratedColumn<String> pointClientUuid = GeneratedColumn<String>(
      'point_client_uuid', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _localOriginalPathMeta =
      const VerificationMeta('localOriginalPath');
  @override
  late final GeneratedColumn<String> localOriginalPath =
      GeneratedColumn<String>('local_original_path', aliasedName, false,
          type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _localUploadPathMeta =
      const VerificationMeta('localUploadPath');
  @override
  late final GeneratedColumn<String> localUploadPath = GeneratedColumn<String>(
      'local_upload_path', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _localThumbPathMeta =
      const VerificationMeta('localThumbPath');
  @override
  late final GeneratedColumn<String> localThumbPath = GeneratedColumn<String>(
      'local_thumb_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _sha256Meta = const VerificationMeta('sha256');
  @override
  late final GeneratedColumn<String> sha256 = GeneratedColumn<String>(
      'sha256', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _byteSizeMeta =
      const VerificationMeta('byteSize');
  @override
  late final GeneratedColumn<int> byteSize = GeneratedColumn<int>(
      'byte_size', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _contentTypeMeta =
      const VerificationMeta('contentType');
  @override
  late final GeneratedColumn<String> contentType = GeneratedColumn<String>(
      'content_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _widthPxMeta =
      const VerificationMeta('widthPx');
  @override
  late final GeneratedColumn<int> widthPx = GeneratedColumn<int>(
      'width_px', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _heightPxMeta =
      const VerificationMeta('heightPx');
  @override
  late final GeneratedColumn<int> heightPx = GeneratedColumn<int>(
      'height_px', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _tusUrlMeta = const VerificationMeta('tusUrl');
  @override
  late final GeneratedColumn<String> tusUrl = GeneratedColumn<String>(
      'tus_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _tusOffsetMeta =
      const VerificationMeta('tusOffset');
  @override
  late final GeneratedColumn<int> tusOffset = GeneratedColumn<int>(
      'tus_offset', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _uploadTokenMeta =
      const VerificationMeta('uploadToken');
  @override
  late final GeneratedColumn<String> uploadToken = GeneratedColumn<String>(
      'upload_token', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _tusUploadIdMeta =
      const VerificationMeta('tusUploadId');
  @override
  late final GeneratedColumn<String> tusUploadId = GeneratedColumn<String>(
      'tus_upload_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
      'sync_status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _progressPctMeta =
      const VerificationMeta('progressPct');
  @override
  late final GeneratedColumn<double> progressPct = GeneratedColumn<double>(
      'progress_pct', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _lastErrorMeta =
      const VerificationMeta('lastError');
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
      'last_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
      'created_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        clientUuid,
        serverId,
        pointClientUuid,
        projectId,
        localOriginalPath,
        localUploadPath,
        localThumbPath,
        sha256,
        byteSize,
        contentType,
        widthPx,
        heightPx,
        tusUrl,
        tusOffset,
        uploadToken,
        tusUploadId,
        syncStatus,
        progressPct,
        lastError,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'photos';
  @override
  VerificationContext validateIntegrity(Insertable<Photo> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('client_uuid')) {
      context.handle(
          _clientUuidMeta,
          clientUuid.isAcceptableOrUnknown(
              data['client_uuid']!, _clientUuidMeta));
    } else if (isInserting) {
      context.missing(_clientUuidMeta);
    }
    if (data.containsKey('server_id')) {
      context.handle(_serverIdMeta,
          serverId.isAcceptableOrUnknown(data['server_id']!, _serverIdMeta));
    }
    if (data.containsKey('point_client_uuid')) {
      context.handle(
          _pointClientUuidMeta,
          pointClientUuid.isAcceptableOrUnknown(
              data['point_client_uuid']!, _pointClientUuidMeta));
    } else if (isInserting) {
      context.missing(_pointClientUuidMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('local_original_path')) {
      context.handle(
          _localOriginalPathMeta,
          localOriginalPath.isAcceptableOrUnknown(
              data['local_original_path']!, _localOriginalPathMeta));
    } else if (isInserting) {
      context.missing(_localOriginalPathMeta);
    }
    if (data.containsKey('local_upload_path')) {
      context.handle(
          _localUploadPathMeta,
          localUploadPath.isAcceptableOrUnknown(
              data['local_upload_path']!, _localUploadPathMeta));
    } else if (isInserting) {
      context.missing(_localUploadPathMeta);
    }
    if (data.containsKey('local_thumb_path')) {
      context.handle(
          _localThumbPathMeta,
          localThumbPath.isAcceptableOrUnknown(
              data['local_thumb_path']!, _localThumbPathMeta));
    }
    if (data.containsKey('sha256')) {
      context.handle(_sha256Meta,
          sha256.isAcceptableOrUnknown(data['sha256']!, _sha256Meta));
    } else if (isInserting) {
      context.missing(_sha256Meta);
    }
    if (data.containsKey('byte_size')) {
      context.handle(_byteSizeMeta,
          byteSize.isAcceptableOrUnknown(data['byte_size']!, _byteSizeMeta));
    } else if (isInserting) {
      context.missing(_byteSizeMeta);
    }
    if (data.containsKey('content_type')) {
      context.handle(
          _contentTypeMeta,
          contentType.isAcceptableOrUnknown(
              data['content_type']!, _contentTypeMeta));
    } else if (isInserting) {
      context.missing(_contentTypeMeta);
    }
    if (data.containsKey('width_px')) {
      context.handle(_widthPxMeta,
          widthPx.isAcceptableOrUnknown(data['width_px']!, _widthPxMeta));
    }
    if (data.containsKey('height_px')) {
      context.handle(_heightPxMeta,
          heightPx.isAcceptableOrUnknown(data['height_px']!, _heightPxMeta));
    }
    if (data.containsKey('tus_url')) {
      context.handle(_tusUrlMeta,
          tusUrl.isAcceptableOrUnknown(data['tus_url']!, _tusUrlMeta));
    }
    if (data.containsKey('tus_offset')) {
      context.handle(_tusOffsetMeta,
          tusOffset.isAcceptableOrUnknown(data['tus_offset']!, _tusOffsetMeta));
    }
    if (data.containsKey('upload_token')) {
      context.handle(
          _uploadTokenMeta,
          uploadToken.isAcceptableOrUnknown(
              data['upload_token']!, _uploadTokenMeta));
    }
    if (data.containsKey('tus_upload_id')) {
      context.handle(
          _tusUploadIdMeta,
          tusUploadId.isAcceptableOrUnknown(
              data['tus_upload_id']!, _tusUploadIdMeta));
    }
    if (data.containsKey('sync_status')) {
      context.handle(
          _syncStatusMeta,
          syncStatus.isAcceptableOrUnknown(
              data['sync_status']!, _syncStatusMeta));
    } else if (isInserting) {
      context.missing(_syncStatusMeta);
    }
    if (data.containsKey('progress_pct')) {
      context.handle(
          _progressPctMeta,
          progressPct.isAcceptableOrUnknown(
              data['progress_pct']!, _progressPctMeta));
    }
    if (data.containsKey('last_error')) {
      context.handle(_lastErrorMeta,
          lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {clientUuid};
  @override
  Photo map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Photo(
      clientUuid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}client_uuid'])!,
      serverId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}server_id']),
      pointClientUuid: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}point_client_uuid'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      localOriginalPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}local_original_path'])!,
      localUploadPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}local_upload_path'])!,
      localThumbPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}local_thumb_path']),
      sha256: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sha256'])!,
      byteSize: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}byte_size'])!,
      contentType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content_type'])!,
      widthPx: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}width_px']),
      heightPx: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}height_px']),
      tusUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tus_url']),
      tusOffset: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}tus_offset'])!,
      uploadToken: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}upload_token']),
      tusUploadId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tus_upload_id']),
      syncStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sync_status'])!,
      progressPct: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}progress_pct'])!,
      lastError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_error']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $PhotosTable createAlias(String alias) {
    return $PhotosTable(attachedDatabase, alias);
  }
}

class Photo extends DataClass implements Insertable<Photo> {
  final String clientUuid;
  final String? serverId;
  final String pointClientUuid;
  final String projectId;
  final String localOriginalPath;
  final String localUploadPath;
  final String? localThumbPath;
  final String sha256;
  final int byteSize;
  final String contentType;
  final int? widthPx;
  final int? heightPx;
  final String? tusUrl;
  final int tusOffset;

  /// Short-lived TUS token (≤2h). Not a session JWT (KD-37).
  final String? uploadToken;
  final String? tusUploadId;
  final String syncStatus;
  final double progressPct;
  final String? lastError;
  final String createdAt;
  final String updatedAt;
  const Photo(
      {required this.clientUuid,
      this.serverId,
      required this.pointClientUuid,
      required this.projectId,
      required this.localOriginalPath,
      required this.localUploadPath,
      this.localThumbPath,
      required this.sha256,
      required this.byteSize,
      required this.contentType,
      this.widthPx,
      this.heightPx,
      this.tusUrl,
      required this.tusOffset,
      this.uploadToken,
      this.tusUploadId,
      required this.syncStatus,
      required this.progressPct,
      this.lastError,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['client_uuid'] = Variable<String>(clientUuid);
    if (!nullToAbsent || serverId != null) {
      map['server_id'] = Variable<String>(serverId);
    }
    map['point_client_uuid'] = Variable<String>(pointClientUuid);
    map['project_id'] = Variable<String>(projectId);
    map['local_original_path'] = Variable<String>(localOriginalPath);
    map['local_upload_path'] = Variable<String>(localUploadPath);
    if (!nullToAbsent || localThumbPath != null) {
      map['local_thumb_path'] = Variable<String>(localThumbPath);
    }
    map['sha256'] = Variable<String>(sha256);
    map['byte_size'] = Variable<int>(byteSize);
    map['content_type'] = Variable<String>(contentType);
    if (!nullToAbsent || widthPx != null) {
      map['width_px'] = Variable<int>(widthPx);
    }
    if (!nullToAbsent || heightPx != null) {
      map['height_px'] = Variable<int>(heightPx);
    }
    if (!nullToAbsent || tusUrl != null) {
      map['tus_url'] = Variable<String>(tusUrl);
    }
    map['tus_offset'] = Variable<int>(tusOffset);
    if (!nullToAbsent || uploadToken != null) {
      map['upload_token'] = Variable<String>(uploadToken);
    }
    if (!nullToAbsent || tusUploadId != null) {
      map['tus_upload_id'] = Variable<String>(tusUploadId);
    }
    map['sync_status'] = Variable<String>(syncStatus);
    map['progress_pct'] = Variable<double>(progressPct);
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  PhotosCompanion toCompanion(bool nullToAbsent) {
    return PhotosCompanion(
      clientUuid: Value(clientUuid),
      serverId: serverId == null && nullToAbsent
          ? const Value.absent()
          : Value(serverId),
      pointClientUuid: Value(pointClientUuid),
      projectId: Value(projectId),
      localOriginalPath: Value(localOriginalPath),
      localUploadPath: Value(localUploadPath),
      localThumbPath: localThumbPath == null && nullToAbsent
          ? const Value.absent()
          : Value(localThumbPath),
      sha256: Value(sha256),
      byteSize: Value(byteSize),
      contentType: Value(contentType),
      widthPx: widthPx == null && nullToAbsent
          ? const Value.absent()
          : Value(widthPx),
      heightPx: heightPx == null && nullToAbsent
          ? const Value.absent()
          : Value(heightPx),
      tusUrl:
          tusUrl == null && nullToAbsent ? const Value.absent() : Value(tusUrl),
      tusOffset: Value(tusOffset),
      uploadToken: uploadToken == null && nullToAbsent
          ? const Value.absent()
          : Value(uploadToken),
      tusUploadId: tusUploadId == null && nullToAbsent
          ? const Value.absent()
          : Value(tusUploadId),
      syncStatus: Value(syncStatus),
      progressPct: Value(progressPct),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory Photo.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Photo(
      clientUuid: serializer.fromJson<String>(json['clientUuid']),
      serverId: serializer.fromJson<String?>(json['serverId']),
      pointClientUuid: serializer.fromJson<String>(json['pointClientUuid']),
      projectId: serializer.fromJson<String>(json['projectId']),
      localOriginalPath: serializer.fromJson<String>(json['localOriginalPath']),
      localUploadPath: serializer.fromJson<String>(json['localUploadPath']),
      localThumbPath: serializer.fromJson<String?>(json['localThumbPath']),
      sha256: serializer.fromJson<String>(json['sha256']),
      byteSize: serializer.fromJson<int>(json['byteSize']),
      contentType: serializer.fromJson<String>(json['contentType']),
      widthPx: serializer.fromJson<int?>(json['widthPx']),
      heightPx: serializer.fromJson<int?>(json['heightPx']),
      tusUrl: serializer.fromJson<String?>(json['tusUrl']),
      tusOffset: serializer.fromJson<int>(json['tusOffset']),
      uploadToken: serializer.fromJson<String?>(json['uploadToken']),
      tusUploadId: serializer.fromJson<String?>(json['tusUploadId']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      progressPct: serializer.fromJson<double>(json['progressPct']),
      lastError: serializer.fromJson<String?>(json['lastError']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'clientUuid': serializer.toJson<String>(clientUuid),
      'serverId': serializer.toJson<String?>(serverId),
      'pointClientUuid': serializer.toJson<String>(pointClientUuid),
      'projectId': serializer.toJson<String>(projectId),
      'localOriginalPath': serializer.toJson<String>(localOriginalPath),
      'localUploadPath': serializer.toJson<String>(localUploadPath),
      'localThumbPath': serializer.toJson<String?>(localThumbPath),
      'sha256': serializer.toJson<String>(sha256),
      'byteSize': serializer.toJson<int>(byteSize),
      'contentType': serializer.toJson<String>(contentType),
      'widthPx': serializer.toJson<int?>(widthPx),
      'heightPx': serializer.toJson<int?>(heightPx),
      'tusUrl': serializer.toJson<String?>(tusUrl),
      'tusOffset': serializer.toJson<int>(tusOffset),
      'uploadToken': serializer.toJson<String?>(uploadToken),
      'tusUploadId': serializer.toJson<String?>(tusUploadId),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'progressPct': serializer.toJson<double>(progressPct),
      'lastError': serializer.toJson<String?>(lastError),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  Photo copyWith(
          {String? clientUuid,
          Value<String?> serverId = const Value.absent(),
          String? pointClientUuid,
          String? projectId,
          String? localOriginalPath,
          String? localUploadPath,
          Value<String?> localThumbPath = const Value.absent(),
          String? sha256,
          int? byteSize,
          String? contentType,
          Value<int?> widthPx = const Value.absent(),
          Value<int?> heightPx = const Value.absent(),
          Value<String?> tusUrl = const Value.absent(),
          int? tusOffset,
          Value<String?> uploadToken = const Value.absent(),
          Value<String?> tusUploadId = const Value.absent(),
          String? syncStatus,
          double? progressPct,
          Value<String?> lastError = const Value.absent(),
          String? createdAt,
          String? updatedAt}) =>
      Photo(
        clientUuid: clientUuid ?? this.clientUuid,
        serverId: serverId.present ? serverId.value : this.serverId,
        pointClientUuid: pointClientUuid ?? this.pointClientUuid,
        projectId: projectId ?? this.projectId,
        localOriginalPath: localOriginalPath ?? this.localOriginalPath,
        localUploadPath: localUploadPath ?? this.localUploadPath,
        localThumbPath:
            localThumbPath.present ? localThumbPath.value : this.localThumbPath,
        sha256: sha256 ?? this.sha256,
        byteSize: byteSize ?? this.byteSize,
        contentType: contentType ?? this.contentType,
        widthPx: widthPx.present ? widthPx.value : this.widthPx,
        heightPx: heightPx.present ? heightPx.value : this.heightPx,
        tusUrl: tusUrl.present ? tusUrl.value : this.tusUrl,
        tusOffset: tusOffset ?? this.tusOffset,
        uploadToken: uploadToken.present ? uploadToken.value : this.uploadToken,
        tusUploadId: tusUploadId.present ? tusUploadId.value : this.tusUploadId,
        syncStatus: syncStatus ?? this.syncStatus,
        progressPct: progressPct ?? this.progressPct,
        lastError: lastError.present ? lastError.value : this.lastError,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  Photo copyWithCompanion(PhotosCompanion data) {
    return Photo(
      clientUuid:
          data.clientUuid.present ? data.clientUuid.value : this.clientUuid,
      serverId: data.serverId.present ? data.serverId.value : this.serverId,
      pointClientUuid: data.pointClientUuid.present
          ? data.pointClientUuid.value
          : this.pointClientUuid,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      localOriginalPath: data.localOriginalPath.present
          ? data.localOriginalPath.value
          : this.localOriginalPath,
      localUploadPath: data.localUploadPath.present
          ? data.localUploadPath.value
          : this.localUploadPath,
      localThumbPath: data.localThumbPath.present
          ? data.localThumbPath.value
          : this.localThumbPath,
      sha256: data.sha256.present ? data.sha256.value : this.sha256,
      byteSize: data.byteSize.present ? data.byteSize.value : this.byteSize,
      contentType:
          data.contentType.present ? data.contentType.value : this.contentType,
      widthPx: data.widthPx.present ? data.widthPx.value : this.widthPx,
      heightPx: data.heightPx.present ? data.heightPx.value : this.heightPx,
      tusUrl: data.tusUrl.present ? data.tusUrl.value : this.tusUrl,
      tusOffset: data.tusOffset.present ? data.tusOffset.value : this.tusOffset,
      uploadToken:
          data.uploadToken.present ? data.uploadToken.value : this.uploadToken,
      tusUploadId:
          data.tusUploadId.present ? data.tusUploadId.value : this.tusUploadId,
      syncStatus:
          data.syncStatus.present ? data.syncStatus.value : this.syncStatus,
      progressPct:
          data.progressPct.present ? data.progressPct.value : this.progressPct,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Photo(')
          ..write('clientUuid: $clientUuid, ')
          ..write('serverId: $serverId, ')
          ..write('pointClientUuid: $pointClientUuid, ')
          ..write('projectId: $projectId, ')
          ..write('localOriginalPath: $localOriginalPath, ')
          ..write('localUploadPath: $localUploadPath, ')
          ..write('localThumbPath: $localThumbPath, ')
          ..write('sha256: $sha256, ')
          ..write('byteSize: $byteSize, ')
          ..write('contentType: $contentType, ')
          ..write('widthPx: $widthPx, ')
          ..write('heightPx: $heightPx, ')
          ..write('tusUrl: $tusUrl, ')
          ..write('tusOffset: $tusOffset, ')
          ..write('uploadToken: $uploadToken, ')
          ..write('tusUploadId: $tusUploadId, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('progressPct: $progressPct, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        clientUuid,
        serverId,
        pointClientUuid,
        projectId,
        localOriginalPath,
        localUploadPath,
        localThumbPath,
        sha256,
        byteSize,
        contentType,
        widthPx,
        heightPx,
        tusUrl,
        tusOffset,
        uploadToken,
        tusUploadId,
        syncStatus,
        progressPct,
        lastError,
        createdAt,
        updatedAt
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Photo &&
          other.clientUuid == this.clientUuid &&
          other.serverId == this.serverId &&
          other.pointClientUuid == this.pointClientUuid &&
          other.projectId == this.projectId &&
          other.localOriginalPath == this.localOriginalPath &&
          other.localUploadPath == this.localUploadPath &&
          other.localThumbPath == this.localThumbPath &&
          other.sha256 == this.sha256 &&
          other.byteSize == this.byteSize &&
          other.contentType == this.contentType &&
          other.widthPx == this.widthPx &&
          other.heightPx == this.heightPx &&
          other.tusUrl == this.tusUrl &&
          other.tusOffset == this.tusOffset &&
          other.uploadToken == this.uploadToken &&
          other.tusUploadId == this.tusUploadId &&
          other.syncStatus == this.syncStatus &&
          other.progressPct == this.progressPct &&
          other.lastError == this.lastError &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class PhotosCompanion extends UpdateCompanion<Photo> {
  final Value<String> clientUuid;
  final Value<String?> serverId;
  final Value<String> pointClientUuid;
  final Value<String> projectId;
  final Value<String> localOriginalPath;
  final Value<String> localUploadPath;
  final Value<String?> localThumbPath;
  final Value<String> sha256;
  final Value<int> byteSize;
  final Value<String> contentType;
  final Value<int?> widthPx;
  final Value<int?> heightPx;
  final Value<String?> tusUrl;
  final Value<int> tusOffset;
  final Value<String?> uploadToken;
  final Value<String?> tusUploadId;
  final Value<String> syncStatus;
  final Value<double> progressPct;
  final Value<String?> lastError;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const PhotosCompanion({
    this.clientUuid = const Value.absent(),
    this.serverId = const Value.absent(),
    this.pointClientUuid = const Value.absent(),
    this.projectId = const Value.absent(),
    this.localOriginalPath = const Value.absent(),
    this.localUploadPath = const Value.absent(),
    this.localThumbPath = const Value.absent(),
    this.sha256 = const Value.absent(),
    this.byteSize = const Value.absent(),
    this.contentType = const Value.absent(),
    this.widthPx = const Value.absent(),
    this.heightPx = const Value.absent(),
    this.tusUrl = const Value.absent(),
    this.tusOffset = const Value.absent(),
    this.uploadToken = const Value.absent(),
    this.tusUploadId = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.progressPct = const Value.absent(),
    this.lastError = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  PhotosCompanion.insert({
    required String clientUuid,
    this.serverId = const Value.absent(),
    required String pointClientUuid,
    required String projectId,
    required String localOriginalPath,
    required String localUploadPath,
    this.localThumbPath = const Value.absent(),
    required String sha256,
    required int byteSize,
    required String contentType,
    this.widthPx = const Value.absent(),
    this.heightPx = const Value.absent(),
    this.tusUrl = const Value.absent(),
    this.tusOffset = const Value.absent(),
    this.uploadToken = const Value.absent(),
    this.tusUploadId = const Value.absent(),
    required String syncStatus,
    this.progressPct = const Value.absent(),
    this.lastError = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  })  : clientUuid = Value(clientUuid),
        pointClientUuid = Value(pointClientUuid),
        projectId = Value(projectId),
        localOriginalPath = Value(localOriginalPath),
        localUploadPath = Value(localUploadPath),
        sha256 = Value(sha256),
        byteSize = Value(byteSize),
        contentType = Value(contentType),
        syncStatus = Value(syncStatus),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<Photo> custom({
    Expression<String>? clientUuid,
    Expression<String>? serverId,
    Expression<String>? pointClientUuid,
    Expression<String>? projectId,
    Expression<String>? localOriginalPath,
    Expression<String>? localUploadPath,
    Expression<String>? localThumbPath,
    Expression<String>? sha256,
    Expression<int>? byteSize,
    Expression<String>? contentType,
    Expression<int>? widthPx,
    Expression<int>? heightPx,
    Expression<String>? tusUrl,
    Expression<int>? tusOffset,
    Expression<String>? uploadToken,
    Expression<String>? tusUploadId,
    Expression<String>? syncStatus,
    Expression<double>? progressPct,
    Expression<String>? lastError,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (clientUuid != null) 'client_uuid': clientUuid,
      if (serverId != null) 'server_id': serverId,
      if (pointClientUuid != null) 'point_client_uuid': pointClientUuid,
      if (projectId != null) 'project_id': projectId,
      if (localOriginalPath != null) 'local_original_path': localOriginalPath,
      if (localUploadPath != null) 'local_upload_path': localUploadPath,
      if (localThumbPath != null) 'local_thumb_path': localThumbPath,
      if (sha256 != null) 'sha256': sha256,
      if (byteSize != null) 'byte_size': byteSize,
      if (contentType != null) 'content_type': contentType,
      if (widthPx != null) 'width_px': widthPx,
      if (heightPx != null) 'height_px': heightPx,
      if (tusUrl != null) 'tus_url': tusUrl,
      if (tusOffset != null) 'tus_offset': tusOffset,
      if (uploadToken != null) 'upload_token': uploadToken,
      if (tusUploadId != null) 'tus_upload_id': tusUploadId,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (progressPct != null) 'progress_pct': progressPct,
      if (lastError != null) 'last_error': lastError,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  PhotosCompanion copyWith(
      {Value<String>? clientUuid,
      Value<String?>? serverId,
      Value<String>? pointClientUuid,
      Value<String>? projectId,
      Value<String>? localOriginalPath,
      Value<String>? localUploadPath,
      Value<String?>? localThumbPath,
      Value<String>? sha256,
      Value<int>? byteSize,
      Value<String>? contentType,
      Value<int?>? widthPx,
      Value<int?>? heightPx,
      Value<String?>? tusUrl,
      Value<int>? tusOffset,
      Value<String?>? uploadToken,
      Value<String?>? tusUploadId,
      Value<String>? syncStatus,
      Value<double>? progressPct,
      Value<String?>? lastError,
      Value<String>? createdAt,
      Value<String>? updatedAt,
      Value<int>? rowid}) {
    return PhotosCompanion(
      clientUuid: clientUuid ?? this.clientUuid,
      serverId: serverId ?? this.serverId,
      pointClientUuid: pointClientUuid ?? this.pointClientUuid,
      projectId: projectId ?? this.projectId,
      localOriginalPath: localOriginalPath ?? this.localOriginalPath,
      localUploadPath: localUploadPath ?? this.localUploadPath,
      localThumbPath: localThumbPath ?? this.localThumbPath,
      sha256: sha256 ?? this.sha256,
      byteSize: byteSize ?? this.byteSize,
      contentType: contentType ?? this.contentType,
      widthPx: widthPx ?? this.widthPx,
      heightPx: heightPx ?? this.heightPx,
      tusUrl: tusUrl ?? this.tusUrl,
      tusOffset: tusOffset ?? this.tusOffset,
      uploadToken: uploadToken ?? this.uploadToken,
      tusUploadId: tusUploadId ?? this.tusUploadId,
      syncStatus: syncStatus ?? this.syncStatus,
      progressPct: progressPct ?? this.progressPct,
      lastError: lastError ?? this.lastError,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (clientUuid.present) {
      map['client_uuid'] = Variable<String>(clientUuid.value);
    }
    if (serverId.present) {
      map['server_id'] = Variable<String>(serverId.value);
    }
    if (pointClientUuid.present) {
      map['point_client_uuid'] = Variable<String>(pointClientUuid.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (localOriginalPath.present) {
      map['local_original_path'] = Variable<String>(localOriginalPath.value);
    }
    if (localUploadPath.present) {
      map['local_upload_path'] = Variable<String>(localUploadPath.value);
    }
    if (localThumbPath.present) {
      map['local_thumb_path'] = Variable<String>(localThumbPath.value);
    }
    if (sha256.present) {
      map['sha256'] = Variable<String>(sha256.value);
    }
    if (byteSize.present) {
      map['byte_size'] = Variable<int>(byteSize.value);
    }
    if (contentType.present) {
      map['content_type'] = Variable<String>(contentType.value);
    }
    if (widthPx.present) {
      map['width_px'] = Variable<int>(widthPx.value);
    }
    if (heightPx.present) {
      map['height_px'] = Variable<int>(heightPx.value);
    }
    if (tusUrl.present) {
      map['tus_url'] = Variable<String>(tusUrl.value);
    }
    if (tusOffset.present) {
      map['tus_offset'] = Variable<int>(tusOffset.value);
    }
    if (uploadToken.present) {
      map['upload_token'] = Variable<String>(uploadToken.value);
    }
    if (tusUploadId.present) {
      map['tus_upload_id'] = Variable<String>(tusUploadId.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (progressPct.present) {
      map['progress_pct'] = Variable<double>(progressPct.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PhotosCompanion(')
          ..write('clientUuid: $clientUuid, ')
          ..write('serverId: $serverId, ')
          ..write('pointClientUuid: $pointClientUuid, ')
          ..write('projectId: $projectId, ')
          ..write('localOriginalPath: $localOriginalPath, ')
          ..write('localUploadPath: $localUploadPath, ')
          ..write('localThumbPath: $localThumbPath, ')
          ..write('sha256: $sha256, ')
          ..write('byteSize: $byteSize, ')
          ..write('contentType: $contentType, ')
          ..write('widthPx: $widthPx, ')
          ..write('heightPx: $heightPx, ')
          ..write('tusUrl: $tusUrl, ')
          ..write('tusOffset: $tusOffset, ')
          ..write('uploadToken: $uploadToken, ')
          ..write('tusUploadId: $tusUploadId, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('progressPct: $progressPct, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $OutboxTable extends Outbox with TableInfo<$OutboxTable, OutboxData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OutboxTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _payloadJsonMeta =
      const VerificationMeta('payloadJson');
  @override
  late final GeneratedColumn<String> payloadJson = GeneratedColumn<String>(
      'payload_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dependsOnMeta =
      const VerificationMeta('dependsOn');
  @override
  late final GeneratedColumn<String> dependsOn = GeneratedColumn<String>(
      'depends_on', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _priorityMeta =
      const VerificationMeta('priority');
  @override
  late final GeneratedColumn<int> priority = GeneratedColumn<int>(
      'priority', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _attemptsMeta =
      const VerificationMeta('attempts');
  @override
  late final GeneratedColumn<int> attempts = GeneratedColumn<int>(
      'attempts', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _nextAttemptAtMeta =
      const VerificationMeta('nextAttemptAt');
  @override
  late final GeneratedColumn<String> nextAttemptAt = GeneratedColumn<String>(
      'next_attempt_at', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _lastErrorMeta =
      const VerificationMeta('lastError');
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
      'last_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
      'created_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        type,
        payloadJson,
        dependsOn,
        priority,
        status,
        attempts,
        nextAttemptAt,
        lastError,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'outbox';
  @override
  VerificationContext validateIntegrity(Insertable<OutboxData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('payload_json')) {
      context.handle(
          _payloadJsonMeta,
          payloadJson.isAcceptableOrUnknown(
              data['payload_json']!, _payloadJsonMeta));
    } else if (isInserting) {
      context.missing(_payloadJsonMeta);
    }
    if (data.containsKey('depends_on')) {
      context.handle(_dependsOnMeta,
          dependsOn.isAcceptableOrUnknown(data['depends_on']!, _dependsOnMeta));
    }
    if (data.containsKey('priority')) {
      context.handle(_priorityMeta,
          priority.isAcceptableOrUnknown(data['priority']!, _priorityMeta));
    } else if (isInserting) {
      context.missing(_priorityMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('attempts')) {
      context.handle(_attemptsMeta,
          attempts.isAcceptableOrUnknown(data['attempts']!, _attemptsMeta));
    }
    if (data.containsKey('next_attempt_at')) {
      context.handle(
          _nextAttemptAtMeta,
          nextAttemptAt.isAcceptableOrUnknown(
              data['next_attempt_at']!, _nextAttemptAtMeta));
    }
    if (data.containsKey('last_error')) {
      context.handle(_lastErrorMeta,
          lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OutboxData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OutboxData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      payloadJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payload_json'])!,
      dependsOn: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}depends_on']),
      priority: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}priority'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      attempts: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}attempts'])!,
      nextAttemptAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}next_attempt_at']),
      lastError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_error']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $OutboxTable createAlias(String alias) {
    return $OutboxTable(attachedDatabase, alias);
  }
}

class OutboxData extends DataClass implements Insertable<OutboxData> {
  final String id;

  /// CreateInspectionPoint | UploadPhoto only. No UpdatePointLocal.
  final String type;
  final String payloadJson;
  final String? dependsOn;
  final int priority;
  final String status;
  final int attempts;
  final String? nextAttemptAt;
  final String? lastError;
  final String createdAt;
  final String updatedAt;
  const OutboxData(
      {required this.id,
      required this.type,
      required this.payloadJson,
      this.dependsOn,
      required this.priority,
      required this.status,
      required this.attempts,
      this.nextAttemptAt,
      this.lastError,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['type'] = Variable<String>(type);
    map['payload_json'] = Variable<String>(payloadJson);
    if (!nullToAbsent || dependsOn != null) {
      map['depends_on'] = Variable<String>(dependsOn);
    }
    map['priority'] = Variable<int>(priority);
    map['status'] = Variable<String>(status);
    map['attempts'] = Variable<int>(attempts);
    if (!nullToAbsent || nextAttemptAt != null) {
      map['next_attempt_at'] = Variable<String>(nextAttemptAt);
    }
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  OutboxCompanion toCompanion(bool nullToAbsent) {
    return OutboxCompanion(
      id: Value(id),
      type: Value(type),
      payloadJson: Value(payloadJson),
      dependsOn: dependsOn == null && nullToAbsent
          ? const Value.absent()
          : Value(dependsOn),
      priority: Value(priority),
      status: Value(status),
      attempts: Value(attempts),
      nextAttemptAt: nextAttemptAt == null && nullToAbsent
          ? const Value.absent()
          : Value(nextAttemptAt),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory OutboxData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OutboxData(
      id: serializer.fromJson<String>(json['id']),
      type: serializer.fromJson<String>(json['type']),
      payloadJson: serializer.fromJson<String>(json['payloadJson']),
      dependsOn: serializer.fromJson<String?>(json['dependsOn']),
      priority: serializer.fromJson<int>(json['priority']),
      status: serializer.fromJson<String>(json['status']),
      attempts: serializer.fromJson<int>(json['attempts']),
      nextAttemptAt: serializer.fromJson<String?>(json['nextAttemptAt']),
      lastError: serializer.fromJson<String?>(json['lastError']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'type': serializer.toJson<String>(type),
      'payloadJson': serializer.toJson<String>(payloadJson),
      'dependsOn': serializer.toJson<String?>(dependsOn),
      'priority': serializer.toJson<int>(priority),
      'status': serializer.toJson<String>(status),
      'attempts': serializer.toJson<int>(attempts),
      'nextAttemptAt': serializer.toJson<String?>(nextAttemptAt),
      'lastError': serializer.toJson<String?>(lastError),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  OutboxData copyWith(
          {String? id,
          String? type,
          String? payloadJson,
          Value<String?> dependsOn = const Value.absent(),
          int? priority,
          String? status,
          int? attempts,
          Value<String?> nextAttemptAt = const Value.absent(),
          Value<String?> lastError = const Value.absent(),
          String? createdAt,
          String? updatedAt}) =>
      OutboxData(
        id: id ?? this.id,
        type: type ?? this.type,
        payloadJson: payloadJson ?? this.payloadJson,
        dependsOn: dependsOn.present ? dependsOn.value : this.dependsOn,
        priority: priority ?? this.priority,
        status: status ?? this.status,
        attempts: attempts ?? this.attempts,
        nextAttemptAt:
            nextAttemptAt.present ? nextAttemptAt.value : this.nextAttemptAt,
        lastError: lastError.present ? lastError.value : this.lastError,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  OutboxData copyWithCompanion(OutboxCompanion data) {
    return OutboxData(
      id: data.id.present ? data.id.value : this.id,
      type: data.type.present ? data.type.value : this.type,
      payloadJson:
          data.payloadJson.present ? data.payloadJson.value : this.payloadJson,
      dependsOn: data.dependsOn.present ? data.dependsOn.value : this.dependsOn,
      priority: data.priority.present ? data.priority.value : this.priority,
      status: data.status.present ? data.status.value : this.status,
      attempts: data.attempts.present ? data.attempts.value : this.attempts,
      nextAttemptAt: data.nextAttemptAt.present
          ? data.nextAttemptAt.value
          : this.nextAttemptAt,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('OutboxData(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('dependsOn: $dependsOn, ')
          ..write('priority: $priority, ')
          ..write('status: $status, ')
          ..write('attempts: $attempts, ')
          ..write('nextAttemptAt: $nextAttemptAt, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, type, payloadJson, dependsOn, priority,
      status, attempts, nextAttemptAt, lastError, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OutboxData &&
          other.id == this.id &&
          other.type == this.type &&
          other.payloadJson == this.payloadJson &&
          other.dependsOn == this.dependsOn &&
          other.priority == this.priority &&
          other.status == this.status &&
          other.attempts == this.attempts &&
          other.nextAttemptAt == this.nextAttemptAt &&
          other.lastError == this.lastError &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class OutboxCompanion extends UpdateCompanion<OutboxData> {
  final Value<String> id;
  final Value<String> type;
  final Value<String> payloadJson;
  final Value<String?> dependsOn;
  final Value<int> priority;
  final Value<String> status;
  final Value<int> attempts;
  final Value<String?> nextAttemptAt;
  final Value<String?> lastError;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const OutboxCompanion({
    this.id = const Value.absent(),
    this.type = const Value.absent(),
    this.payloadJson = const Value.absent(),
    this.dependsOn = const Value.absent(),
    this.priority = const Value.absent(),
    this.status = const Value.absent(),
    this.attempts = const Value.absent(),
    this.nextAttemptAt = const Value.absent(),
    this.lastError = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OutboxCompanion.insert({
    required String id,
    required String type,
    required String payloadJson,
    this.dependsOn = const Value.absent(),
    required int priority,
    required String status,
    this.attempts = const Value.absent(),
    this.nextAttemptAt = const Value.absent(),
    this.lastError = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        type = Value(type),
        payloadJson = Value(payloadJson),
        priority = Value(priority),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<OutboxData> custom({
    Expression<String>? id,
    Expression<String>? type,
    Expression<String>? payloadJson,
    Expression<String>? dependsOn,
    Expression<int>? priority,
    Expression<String>? status,
    Expression<int>? attempts,
    Expression<String>? nextAttemptAt,
    Expression<String>? lastError,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (type != null) 'type': type,
      if (payloadJson != null) 'payload_json': payloadJson,
      if (dependsOn != null) 'depends_on': dependsOn,
      if (priority != null) 'priority': priority,
      if (status != null) 'status': status,
      if (attempts != null) 'attempts': attempts,
      if (nextAttemptAt != null) 'next_attempt_at': nextAttemptAt,
      if (lastError != null) 'last_error': lastError,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OutboxCompanion copyWith(
      {Value<String>? id,
      Value<String>? type,
      Value<String>? payloadJson,
      Value<String?>? dependsOn,
      Value<int>? priority,
      Value<String>? status,
      Value<int>? attempts,
      Value<String?>? nextAttemptAt,
      Value<String?>? lastError,
      Value<String>? createdAt,
      Value<String>? updatedAt,
      Value<int>? rowid}) {
    return OutboxCompanion(
      id: id ?? this.id,
      type: type ?? this.type,
      payloadJson: payloadJson ?? this.payloadJson,
      dependsOn: dependsOn ?? this.dependsOn,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      attempts: attempts ?? this.attempts,
      nextAttemptAt: nextAttemptAt ?? this.nextAttemptAt,
      lastError: lastError ?? this.lastError,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (payloadJson.present) {
      map['payload_json'] = Variable<String>(payloadJson.value);
    }
    if (dependsOn.present) {
      map['depends_on'] = Variable<String>(dependsOn.value);
    }
    if (priority.present) {
      map['priority'] = Variable<int>(priority.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (attempts.present) {
      map['attempts'] = Variable<int>(attempts.value);
    }
    if (nextAttemptAt.present) {
      map['next_attempt_at'] = Variable<String>(nextAttemptAt.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OutboxCompanion(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('dependsOn: $dependsOn, ')
          ..write('priority: $priority, ')
          ..write('status: $status, ')
          ..write('attempts: $attempts, ')
          ..write('nextAttemptAt: $nextAttemptAt, ')
          ..write('lastError: $lastError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncStateTable extends SyncState
    with TableInfo<$SyncStateTable, SyncStateData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncStateTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
      'key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _cursorUpdatedAtMeta =
      const VerificationMeta('cursorUpdatedAt');
  @override
  late final GeneratedColumn<String> cursorUpdatedAt = GeneratedColumn<String>(
      'cursor_updated_at', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cursorIdMeta =
      const VerificationMeta('cursorId');
  @override
  late final GeneratedColumn<String> cursorId = GeneratedColumn<String>(
      'cursor_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _serverTimeMeta =
      const VerificationMeta('serverTime');
  @override
  late final GeneratedColumn<String> serverTime = GeneratedColumn<String>(
      'server_time', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [key, cursorUpdatedAt, cursorId, serverTime, updatedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_state';
  @override
  VerificationContext validateIntegrity(Insertable<SyncStateData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('key')) {
      context.handle(
          _keyMeta, key.isAcceptableOrUnknown(data['key']!, _keyMeta));
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('cursor_updated_at')) {
      context.handle(
          _cursorUpdatedAtMeta,
          cursorUpdatedAt.isAcceptableOrUnknown(
              data['cursor_updated_at']!, _cursorUpdatedAtMeta));
    }
    if (data.containsKey('cursor_id')) {
      context.handle(_cursorIdMeta,
          cursorId.isAcceptableOrUnknown(data['cursor_id']!, _cursorIdMeta));
    }
    if (data.containsKey('server_time')) {
      context.handle(
          _serverTimeMeta,
          serverTime.isAcceptableOrUnknown(
              data['server_time']!, _serverTimeMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {key};
  @override
  SyncStateData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncStateData(
      key: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key'])!,
      cursorUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}cursor_updated_at']),
      cursorId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}cursor_id']),
      serverTime: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}server_time']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $SyncStateTable createAlias(String alias) {
    return $SyncStateTable(attachedDatabase, alias);
  }
}

class SyncStateData extends DataClass implements Insertable<SyncStateData> {
  final String key;
  final String? cursorUpdatedAt;
  final String? cursorId;
  final String? serverTime;
  final String updatedAt;
  const SyncStateData(
      {required this.key,
      this.cursorUpdatedAt,
      this.cursorId,
      this.serverTime,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['key'] = Variable<String>(key);
    if (!nullToAbsent || cursorUpdatedAt != null) {
      map['cursor_updated_at'] = Variable<String>(cursorUpdatedAt);
    }
    if (!nullToAbsent || cursorId != null) {
      map['cursor_id'] = Variable<String>(cursorId);
    }
    if (!nullToAbsent || serverTime != null) {
      map['server_time'] = Variable<String>(serverTime);
    }
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  SyncStateCompanion toCompanion(bool nullToAbsent) {
    return SyncStateCompanion(
      key: Value(key),
      cursorUpdatedAt: cursorUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cursorUpdatedAt),
      cursorId: cursorId == null && nullToAbsent
          ? const Value.absent()
          : Value(cursorId),
      serverTime: serverTime == null && nullToAbsent
          ? const Value.absent()
          : Value(serverTime),
      updatedAt: Value(updatedAt),
    );
  }

  factory SyncStateData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncStateData(
      key: serializer.fromJson<String>(json['key']),
      cursorUpdatedAt: serializer.fromJson<String?>(json['cursorUpdatedAt']),
      cursorId: serializer.fromJson<String?>(json['cursorId']),
      serverTime: serializer.fromJson<String?>(json['serverTime']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'key': serializer.toJson<String>(key),
      'cursorUpdatedAt': serializer.toJson<String?>(cursorUpdatedAt),
      'cursorId': serializer.toJson<String?>(cursorId),
      'serverTime': serializer.toJson<String?>(serverTime),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  SyncStateData copyWith(
          {String? key,
          Value<String?> cursorUpdatedAt = const Value.absent(),
          Value<String?> cursorId = const Value.absent(),
          Value<String?> serverTime = const Value.absent(),
          String? updatedAt}) =>
      SyncStateData(
        key: key ?? this.key,
        cursorUpdatedAt: cursorUpdatedAt.present
            ? cursorUpdatedAt.value
            : this.cursorUpdatedAt,
        cursorId: cursorId.present ? cursorId.value : this.cursorId,
        serverTime: serverTime.present ? serverTime.value : this.serverTime,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  SyncStateData copyWithCompanion(SyncStateCompanion data) {
    return SyncStateData(
      key: data.key.present ? data.key.value : this.key,
      cursorUpdatedAt: data.cursorUpdatedAt.present
          ? data.cursorUpdatedAt.value
          : this.cursorUpdatedAt,
      cursorId: data.cursorId.present ? data.cursorId.value : this.cursorId,
      serverTime:
          data.serverTime.present ? data.serverTime.value : this.serverTime,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncStateData(')
          ..write('key: $key, ')
          ..write('cursorUpdatedAt: $cursorUpdatedAt, ')
          ..write('cursorId: $cursorId, ')
          ..write('serverTime: $serverTime, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(key, cursorUpdatedAt, cursorId, serverTime, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncStateData &&
          other.key == this.key &&
          other.cursorUpdatedAt == this.cursorUpdatedAt &&
          other.cursorId == this.cursorId &&
          other.serverTime == this.serverTime &&
          other.updatedAt == this.updatedAt);
}

class SyncStateCompanion extends UpdateCompanion<SyncStateData> {
  final Value<String> key;
  final Value<String?> cursorUpdatedAt;
  final Value<String?> cursorId;
  final Value<String?> serverTime;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const SyncStateCompanion({
    this.key = const Value.absent(),
    this.cursorUpdatedAt = const Value.absent(),
    this.cursorId = const Value.absent(),
    this.serverTime = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncStateCompanion.insert({
    required String key,
    this.cursorUpdatedAt = const Value.absent(),
    this.cursorId = const Value.absent(),
    this.serverTime = const Value.absent(),
    required String updatedAt,
    this.rowid = const Value.absent(),
  })  : key = Value(key),
        updatedAt = Value(updatedAt);
  static Insertable<SyncStateData> custom({
    Expression<String>? key,
    Expression<String>? cursorUpdatedAt,
    Expression<String>? cursorId,
    Expression<String>? serverTime,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (key != null) 'key': key,
      if (cursorUpdatedAt != null) 'cursor_updated_at': cursorUpdatedAt,
      if (cursorId != null) 'cursor_id': cursorId,
      if (serverTime != null) 'server_time': serverTime,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncStateCompanion copyWith(
      {Value<String>? key,
      Value<String?>? cursorUpdatedAt,
      Value<String?>? cursorId,
      Value<String?>? serverTime,
      Value<String>? updatedAt,
      Value<int>? rowid}) {
    return SyncStateCompanion(
      key: key ?? this.key,
      cursorUpdatedAt: cursorUpdatedAt ?? this.cursorUpdatedAt,
      cursorId: cursorId ?? this.cursorId,
      serverTime: serverTime ?? this.serverTime,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (cursorUpdatedAt.present) {
      map['cursor_updated_at'] = Variable<String>(cursorUpdatedAt.value);
    }
    if (cursorId.present) {
      map['cursor_id'] = Variable<String>(cursorId.value);
    }
    if (serverTime.present) {
      map['server_time'] = Variable<String>(serverTime.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncStateCompanion(')
          ..write('key: $key, ')
          ..write('cursorUpdatedAt: $cursorUpdatedAt, ')
          ..write('cursorId: $cursorId, ')
          ..write('serverTime: $serverTime, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $MapRegionsTable extends MapRegions
    with TableInfo<$MapRegionsTable, MapRegion> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $MapRegionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _minZoomMeta =
      const VerificationMeta('minZoom');
  @override
  late final GeneratedColumn<int> minZoom = GeneratedColumn<int>(
      'min_zoom', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _maxZoomMeta =
      const VerificationMeta('maxZoom');
  @override
  late final GeneratedColumn<int> maxZoom = GeneratedColumn<int>(
      'max_zoom', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _boundsGeojsonMeta =
      const VerificationMeta('boundsGeojson');
  @override
  late final GeneratedColumn<String> boundsGeojson = GeneratedColumn<String>(
      'bounds_geojson', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bytesMeta = const VerificationMeta('bytes');
  @override
  late final GeneratedColumn<int> bytes = GeneratedColumn<int>(
      'bytes', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        minZoom,
        maxZoom,
        boundsGeojson,
        status,
        bytes,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'map_regions';
  @override
  VerificationContext validateIntegrity(Insertable<MapRegion> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('min_zoom')) {
      context.handle(_minZoomMeta,
          minZoom.isAcceptableOrUnknown(data['min_zoom']!, _minZoomMeta));
    } else if (isInserting) {
      context.missing(_minZoomMeta);
    }
    if (data.containsKey('max_zoom')) {
      context.handle(_maxZoomMeta,
          maxZoom.isAcceptableOrUnknown(data['max_zoom']!, _maxZoomMeta));
    } else if (isInserting) {
      context.missing(_maxZoomMeta);
    }
    if (data.containsKey('bounds_geojson')) {
      context.handle(
          _boundsGeojsonMeta,
          boundsGeojson.isAcceptableOrUnknown(
              data['bounds_geojson']!, _boundsGeojsonMeta));
    } else if (isInserting) {
      context.missing(_boundsGeojsonMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('bytes')) {
      context.handle(
          _bytesMeta, bytes.isAcceptableOrUnknown(data['bytes']!, _bytesMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  MapRegion map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return MapRegion(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      minZoom: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}min_zoom'])!,
      maxZoom: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}max_zoom'])!,
      boundsGeojson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}bounds_geojson'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      bytes: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}bytes']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $MapRegionsTable createAlias(String alias) {
    return $MapRegionsTable(attachedDatabase, alias);
  }
}

class MapRegion extends DataClass implements Insertable<MapRegion> {
  final String id;
  final String projectId;
  final int minZoom;
  final int maxZoom;
  final String boundsGeojson;
  final String status;
  final int? bytes;
  final String updatedAt;
  const MapRegion(
      {required this.id,
      required this.projectId,
      required this.minZoom,
      required this.maxZoom,
      required this.boundsGeojson,
      required this.status,
      this.bytes,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['min_zoom'] = Variable<int>(minZoom);
    map['max_zoom'] = Variable<int>(maxZoom);
    map['bounds_geojson'] = Variable<String>(boundsGeojson);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || bytes != null) {
      map['bytes'] = Variable<int>(bytes);
    }
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  MapRegionsCompanion toCompanion(bool nullToAbsent) {
    return MapRegionsCompanion(
      id: Value(id),
      projectId: Value(projectId),
      minZoom: Value(minZoom),
      maxZoom: Value(maxZoom),
      boundsGeojson: Value(boundsGeojson),
      status: Value(status),
      bytes:
          bytes == null && nullToAbsent ? const Value.absent() : Value(bytes),
      updatedAt: Value(updatedAt),
    );
  }

  factory MapRegion.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return MapRegion(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      minZoom: serializer.fromJson<int>(json['minZoom']),
      maxZoom: serializer.fromJson<int>(json['maxZoom']),
      boundsGeojson: serializer.fromJson<String>(json['boundsGeojson']),
      status: serializer.fromJson<String>(json['status']),
      bytes: serializer.fromJson<int?>(json['bytes']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'minZoom': serializer.toJson<int>(minZoom),
      'maxZoom': serializer.toJson<int>(maxZoom),
      'boundsGeojson': serializer.toJson<String>(boundsGeojson),
      'status': serializer.toJson<String>(status),
      'bytes': serializer.toJson<int?>(bytes),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  MapRegion copyWith(
          {String? id,
          String? projectId,
          int? minZoom,
          int? maxZoom,
          String? boundsGeojson,
          String? status,
          Value<int?> bytes = const Value.absent(),
          String? updatedAt}) =>
      MapRegion(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        minZoom: minZoom ?? this.minZoom,
        maxZoom: maxZoom ?? this.maxZoom,
        boundsGeojson: boundsGeojson ?? this.boundsGeojson,
        status: status ?? this.status,
        bytes: bytes.present ? bytes.value : this.bytes,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  MapRegion copyWithCompanion(MapRegionsCompanion data) {
    return MapRegion(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      minZoom: data.minZoom.present ? data.minZoom.value : this.minZoom,
      maxZoom: data.maxZoom.present ? data.maxZoom.value : this.maxZoom,
      boundsGeojson: data.boundsGeojson.present
          ? data.boundsGeojson.value
          : this.boundsGeojson,
      status: data.status.present ? data.status.value : this.status,
      bytes: data.bytes.present ? data.bytes.value : this.bytes,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('MapRegion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('minZoom: $minZoom, ')
          ..write('maxZoom: $maxZoom, ')
          ..write('boundsGeojson: $boundsGeojson, ')
          ..write('status: $status, ')
          ..write('bytes: $bytes, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, projectId, minZoom, maxZoom, boundsGeojson, status, bytes, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is MapRegion &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.minZoom == this.minZoom &&
          other.maxZoom == this.maxZoom &&
          other.boundsGeojson == this.boundsGeojson &&
          other.status == this.status &&
          other.bytes == this.bytes &&
          other.updatedAt == this.updatedAt);
}

class MapRegionsCompanion extends UpdateCompanion<MapRegion> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<int> minZoom;
  final Value<int> maxZoom;
  final Value<String> boundsGeojson;
  final Value<String> status;
  final Value<int?> bytes;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const MapRegionsCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.minZoom = const Value.absent(),
    this.maxZoom = const Value.absent(),
    this.boundsGeojson = const Value.absent(),
    this.status = const Value.absent(),
    this.bytes = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  MapRegionsCompanion.insert({
    required String id,
    required String projectId,
    required int minZoom,
    required int maxZoom,
    required String boundsGeojson,
    required String status,
    this.bytes = const Value.absent(),
    required String updatedAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        minZoom = Value(minZoom),
        maxZoom = Value(maxZoom),
        boundsGeojson = Value(boundsGeojson),
        status = Value(status),
        updatedAt = Value(updatedAt);
  static Insertable<MapRegion> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<int>? minZoom,
    Expression<int>? maxZoom,
    Expression<String>? boundsGeojson,
    Expression<String>? status,
    Expression<int>? bytes,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (minZoom != null) 'min_zoom': minZoom,
      if (maxZoom != null) 'max_zoom': maxZoom,
      if (boundsGeojson != null) 'bounds_geojson': boundsGeojson,
      if (status != null) 'status': status,
      if (bytes != null) 'bytes': bytes,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  MapRegionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<int>? minZoom,
      Value<int>? maxZoom,
      Value<String>? boundsGeojson,
      Value<String>? status,
      Value<int?>? bytes,
      Value<String>? updatedAt,
      Value<int>? rowid}) {
    return MapRegionsCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      minZoom: minZoom ?? this.minZoom,
      maxZoom: maxZoom ?? this.maxZoom,
      boundsGeojson: boundsGeojson ?? this.boundsGeojson,
      status: status ?? this.status,
      bytes: bytes ?? this.bytes,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (minZoom.present) {
      map['min_zoom'] = Variable<int>(minZoom.value);
    }
    if (maxZoom.present) {
      map['max_zoom'] = Variable<int>(maxZoom.value);
    }
    if (boundsGeojson.present) {
      map['bounds_geojson'] = Variable<String>(boundsGeojson.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (bytes.present) {
      map['bytes'] = Variable<int>(bytes.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('MapRegionsCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('minZoom: $minZoom, ')
          ..write('maxZoom: $maxZoom, ')
          ..write('boundsGeojson: $boundsGeojson, ')
          ..write('status: $status, ')
          ..write('bytes: $bytes, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $UsersLocalTable usersLocal = $UsersLocalTable(this);
  late final $ProjectsTable projects = $ProjectsTable(this);
  late final $InspectionPointsTable inspectionPoints =
      $InspectionPointsTable(this);
  late final $PhotosTable photos = $PhotosTable(this);
  late final $OutboxTable outbox = $OutboxTable(this);
  late final $SyncStateTable syncState = $SyncStateTable(this);
  late final $MapRegionsTable mapRegions = $MapRegionsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        usersLocal,
        projects,
        inspectionPoints,
        photos,
        outbox,
        syncState,
        mapRegions
      ];
}

typedef $$UsersLocalTableCreateCompanionBuilder = UsersLocalCompanion Function({
  required String id,
  required String email,
  required String fullName,
  required String role,
  required int tokenVersion,
  Value<int?> lastAuthAt,
  Value<int> rowid,
});
typedef $$UsersLocalTableUpdateCompanionBuilder = UsersLocalCompanion Function({
  Value<String> id,
  Value<String> email,
  Value<String> fullName,
  Value<String> role,
  Value<int> tokenVersion,
  Value<int?> lastAuthAt,
  Value<int> rowid,
});

class $$UsersLocalTableFilterComposer
    extends Composer<_$AppDatabase, $UsersLocalTable> {
  $$UsersLocalTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get tokenVersion => $composableBuilder(
      column: $table.tokenVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get lastAuthAt => $composableBuilder(
      column: $table.lastAuthAt, builder: (column) => ColumnFilters(column));
}

class $$UsersLocalTableOrderingComposer
    extends Composer<_$AppDatabase, $UsersLocalTable> {
  $$UsersLocalTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get tokenVersion => $composableBuilder(
      column: $table.tokenVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get lastAuthAt => $composableBuilder(
      column: $table.lastAuthAt, builder: (column) => ColumnOrderings(column));
}

class $$UsersLocalTableAnnotationComposer
    extends Composer<_$AppDatabase, $UsersLocalTable> {
  $$UsersLocalTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  GeneratedColumn<int> get tokenVersion => $composableBuilder(
      column: $table.tokenVersion, builder: (column) => column);

  GeneratedColumn<int> get lastAuthAt => $composableBuilder(
      column: $table.lastAuthAt, builder: (column) => column);
}

class $$UsersLocalTableTableManager extends RootTableManager<
    _$AppDatabase,
    $UsersLocalTable,
    UsersLocalData,
    $$UsersLocalTableFilterComposer,
    $$UsersLocalTableOrderingComposer,
    $$UsersLocalTableAnnotationComposer,
    $$UsersLocalTableCreateCompanionBuilder,
    $$UsersLocalTableUpdateCompanionBuilder,
    (
      UsersLocalData,
      BaseReferences<_$AppDatabase, $UsersLocalTable, UsersLocalData>
    ),
    UsersLocalData,
    PrefetchHooks Function()> {
  $$UsersLocalTableTableManager(_$AppDatabase db, $UsersLocalTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$UsersLocalTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$UsersLocalTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$UsersLocalTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> email = const Value.absent(),
            Value<String> fullName = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<int> tokenVersion = const Value.absent(),
            Value<int?> lastAuthAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersLocalCompanion(
            id: id,
            email: email,
            fullName: fullName,
            role: role,
            tokenVersion: tokenVersion,
            lastAuthAt: lastAuthAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String email,
            required String fullName,
            required String role,
            required int tokenVersion,
            Value<int?> lastAuthAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersLocalCompanion.insert(
            id: id,
            email: email,
            fullName: fullName,
            role: role,
            tokenVersion: tokenVersion,
            lastAuthAt: lastAuthAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$UsersLocalTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $UsersLocalTable,
    UsersLocalData,
    $$UsersLocalTableFilterComposer,
    $$UsersLocalTableOrderingComposer,
    $$UsersLocalTableAnnotationComposer,
    $$UsersLocalTableCreateCompanionBuilder,
    $$UsersLocalTableUpdateCompanionBuilder,
    (
      UsersLocalData,
      BaseReferences<_$AppDatabase, $UsersLocalTable, UsersLocalData>
    ),
    UsersLocalData,
    PrefetchHooks Function()>;
typedef $$ProjectsTableCreateCompanionBuilder = ProjectsCompanion Function({
  required String id,
  required String name,
  Value<String?> code,
  Value<String?> description,
  Value<String?> boundaryGeojson,
  Value<String?> bboxGeojson,
  Value<int> isArchived,
  required String updatedAt,
  Value<String?> mapCacheStatus,
  Value<int?> mapCacheBytes,
  Value<String?> lastPulledAt,
  Value<String?> lastCursorUpdatedAt,
  Value<String?> lastCursorId,
  Value<int> rowid,
});
typedef $$ProjectsTableUpdateCompanionBuilder = ProjectsCompanion Function({
  Value<String> id,
  Value<String> name,
  Value<String?> code,
  Value<String?> description,
  Value<String?> boundaryGeojson,
  Value<String?> bboxGeojson,
  Value<int> isArchived,
  Value<String> updatedAt,
  Value<String?> mapCacheStatus,
  Value<int?> mapCacheBytes,
  Value<String?> lastPulledAt,
  Value<String?> lastCursorUpdatedAt,
  Value<String?> lastCursorId,
  Value<int> rowid,
});

class $$ProjectsTableFilterComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get code => $composableBuilder(
      column: $table.code, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get boundaryGeojson => $composableBuilder(
      column: $table.boundaryGeojson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get bboxGeojson => $composableBuilder(
      column: $table.bboxGeojson, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get isArchived => $composableBuilder(
      column: $table.isArchived, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get mapCacheStatus => $composableBuilder(
      column: $table.mapCacheStatus,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get mapCacheBytes => $composableBuilder(
      column: $table.mapCacheBytes, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastPulledAt => $composableBuilder(
      column: $table.lastPulledAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastCursorUpdatedAt => $composableBuilder(
      column: $table.lastCursorUpdatedAt,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastCursorId => $composableBuilder(
      column: $table.lastCursorId, builder: (column) => ColumnFilters(column));
}

class $$ProjectsTableOrderingComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get code => $composableBuilder(
      column: $table.code, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get boundaryGeojson => $composableBuilder(
      column: $table.boundaryGeojson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get bboxGeojson => $composableBuilder(
      column: $table.bboxGeojson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get isArchived => $composableBuilder(
      column: $table.isArchived, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get mapCacheStatus => $composableBuilder(
      column: $table.mapCacheStatus,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get mapCacheBytes => $composableBuilder(
      column: $table.mapCacheBytes,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastPulledAt => $composableBuilder(
      column: $table.lastPulledAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastCursorUpdatedAt => $composableBuilder(
      column: $table.lastCursorUpdatedAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastCursorId => $composableBuilder(
      column: $table.lastCursorId,
      builder: (column) => ColumnOrderings(column));
}

class $$ProjectsTableAnnotationComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get code =>
      $composableBuilder(column: $table.code, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get boundaryGeojson => $composableBuilder(
      column: $table.boundaryGeojson, builder: (column) => column);

  GeneratedColumn<String> get bboxGeojson => $composableBuilder(
      column: $table.bboxGeojson, builder: (column) => column);

  GeneratedColumn<int> get isArchived => $composableBuilder(
      column: $table.isArchived, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<String> get mapCacheStatus => $composableBuilder(
      column: $table.mapCacheStatus, builder: (column) => column);

  GeneratedColumn<int> get mapCacheBytes => $composableBuilder(
      column: $table.mapCacheBytes, builder: (column) => column);

  GeneratedColumn<String> get lastPulledAt => $composableBuilder(
      column: $table.lastPulledAt, builder: (column) => column);

  GeneratedColumn<String> get lastCursorUpdatedAt => $composableBuilder(
      column: $table.lastCursorUpdatedAt, builder: (column) => column);

  GeneratedColumn<String> get lastCursorId => $composableBuilder(
      column: $table.lastCursorId, builder: (column) => column);
}

class $$ProjectsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ProjectsTable,
    Project,
    $$ProjectsTableFilterComposer,
    $$ProjectsTableOrderingComposer,
    $$ProjectsTableAnnotationComposer,
    $$ProjectsTableCreateCompanionBuilder,
    $$ProjectsTableUpdateCompanionBuilder,
    (Project, BaseReferences<_$AppDatabase, $ProjectsTable, Project>),
    Project,
    PrefetchHooks Function()> {
  $$ProjectsTableTableManager(_$AppDatabase db, $ProjectsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ProjectsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ProjectsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ProjectsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> code = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String?> boundaryGeojson = const Value.absent(),
            Value<String?> bboxGeojson = const Value.absent(),
            Value<int> isArchived = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<String?> mapCacheStatus = const Value.absent(),
            Value<int?> mapCacheBytes = const Value.absent(),
            Value<String?> lastPulledAt = const Value.absent(),
            Value<String?> lastCursorUpdatedAt = const Value.absent(),
            Value<String?> lastCursorId = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion(
            id: id,
            name: name,
            code: code,
            description: description,
            boundaryGeojson: boundaryGeojson,
            bboxGeojson: bboxGeojson,
            isArchived: isArchived,
            updatedAt: updatedAt,
            mapCacheStatus: mapCacheStatus,
            mapCacheBytes: mapCacheBytes,
            lastPulledAt: lastPulledAt,
            lastCursorUpdatedAt: lastCursorUpdatedAt,
            lastCursorId: lastCursorId,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            Value<String?> code = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String?> boundaryGeojson = const Value.absent(),
            Value<String?> bboxGeojson = const Value.absent(),
            Value<int> isArchived = const Value.absent(),
            required String updatedAt,
            Value<String?> mapCacheStatus = const Value.absent(),
            Value<int?> mapCacheBytes = const Value.absent(),
            Value<String?> lastPulledAt = const Value.absent(),
            Value<String?> lastCursorUpdatedAt = const Value.absent(),
            Value<String?> lastCursorId = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion.insert(
            id: id,
            name: name,
            code: code,
            description: description,
            boundaryGeojson: boundaryGeojson,
            bboxGeojson: bboxGeojson,
            isArchived: isArchived,
            updatedAt: updatedAt,
            mapCacheStatus: mapCacheStatus,
            mapCacheBytes: mapCacheBytes,
            lastPulledAt: lastPulledAt,
            lastCursorUpdatedAt: lastCursorUpdatedAt,
            lastCursorId: lastCursorId,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ProjectsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ProjectsTable,
    Project,
    $$ProjectsTableFilterComposer,
    $$ProjectsTableOrderingComposer,
    $$ProjectsTableAnnotationComposer,
    $$ProjectsTableCreateCompanionBuilder,
    $$ProjectsTableUpdateCompanionBuilder,
    (Project, BaseReferences<_$AppDatabase, $ProjectsTable, Project>),
    Project,
    PrefetchHooks Function()>;
typedef $$InspectionPointsTableCreateCompanionBuilder
    = InspectionPointsCompanion Function({
  required String clientUuid,
  Value<String?> serverId,
  required String projectId,
  required String category,
  Value<String?> note,
  Value<String?> remarks,
  Value<String?> recommendedProcedure,
  Value<String> status,
  required double latitude,
  required double longitude,
  Value<double?> accuracyM,
  Value<double?> altitudeM,
  Value<double?> headingDeg,
  Value<String?> locationSource,
  Value<int> locationAdjusted,
  Value<int> outsideBoundary,
  required String capturedAt,
  Value<String?> clientDeviceInfo,
  Value<int> version,
  required String syncStatus,
  Value<String?> lastError,
  required String createdAt,
  required String updatedAt,
  Value<int> rowid,
});
typedef $$InspectionPointsTableUpdateCompanionBuilder
    = InspectionPointsCompanion Function({
  Value<String> clientUuid,
  Value<String?> serverId,
  Value<String> projectId,
  Value<String> category,
  Value<String?> note,
  Value<String?> remarks,
  Value<String?> recommendedProcedure,
  Value<String> status,
  Value<double> latitude,
  Value<double> longitude,
  Value<double?> accuracyM,
  Value<double?> altitudeM,
  Value<double?> headingDeg,
  Value<String?> locationSource,
  Value<int> locationAdjusted,
  Value<int> outsideBoundary,
  Value<String> capturedAt,
  Value<String?> clientDeviceInfo,
  Value<int> version,
  Value<String> syncStatus,
  Value<String?> lastError,
  Value<String> createdAt,
  Value<String> updatedAt,
  Value<int> rowid,
});

class $$InspectionPointsTableFilterComposer
    extends Composer<_$AppDatabase, $InspectionPointsTable> {
  $$InspectionPointsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get serverId => $composableBuilder(
      column: $table.serverId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get note => $composableBuilder(
      column: $table.note, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get remarks => $composableBuilder(
      column: $table.remarks, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get recommendedProcedure => $composableBuilder(
      column: $table.recommendedProcedure,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get accuracyM => $composableBuilder(
      column: $table.accuracyM, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get altitudeM => $composableBuilder(
      column: $table.altitudeM, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get headingDeg => $composableBuilder(
      column: $table.headingDeg, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get locationSource => $composableBuilder(
      column: $table.locationSource,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get locationAdjusted => $composableBuilder(
      column: $table.locationAdjusted,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get outsideBoundary => $composableBuilder(
      column: $table.outsideBoundary,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get capturedAt => $composableBuilder(
      column: $table.capturedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get clientDeviceInfo => $composableBuilder(
      column: $table.clientDeviceInfo,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get version => $composableBuilder(
      column: $table.version, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$InspectionPointsTableOrderingComposer
    extends Composer<_$AppDatabase, $InspectionPointsTable> {
  $$InspectionPointsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get serverId => $composableBuilder(
      column: $table.serverId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get note => $composableBuilder(
      column: $table.note, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get remarks => $composableBuilder(
      column: $table.remarks, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get recommendedProcedure => $composableBuilder(
      column: $table.recommendedProcedure,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get accuracyM => $composableBuilder(
      column: $table.accuracyM, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get altitudeM => $composableBuilder(
      column: $table.altitudeM, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get headingDeg => $composableBuilder(
      column: $table.headingDeg, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get locationSource => $composableBuilder(
      column: $table.locationSource,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get locationAdjusted => $composableBuilder(
      column: $table.locationAdjusted,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get outsideBoundary => $composableBuilder(
      column: $table.outsideBoundary,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get capturedAt => $composableBuilder(
      column: $table.capturedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get clientDeviceInfo => $composableBuilder(
      column: $table.clientDeviceInfo,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get version => $composableBuilder(
      column: $table.version, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$InspectionPointsTableAnnotationComposer
    extends Composer<_$AppDatabase, $InspectionPointsTable> {
  $$InspectionPointsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => column);

  GeneratedColumn<String> get serverId =>
      $composableBuilder(column: $table.serverId, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get remarks =>
      $composableBuilder(column: $table.remarks, builder: (column) => column);

  GeneratedColumn<String> get recommendedProcedure => $composableBuilder(
      column: $table.recommendedProcedure, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<double> get accuracyM =>
      $composableBuilder(column: $table.accuracyM, builder: (column) => column);

  GeneratedColumn<double> get altitudeM =>
      $composableBuilder(column: $table.altitudeM, builder: (column) => column);

  GeneratedColumn<double> get headingDeg => $composableBuilder(
      column: $table.headingDeg, builder: (column) => column);

  GeneratedColumn<String> get locationSource => $composableBuilder(
      column: $table.locationSource, builder: (column) => column);

  GeneratedColumn<int> get locationAdjusted => $composableBuilder(
      column: $table.locationAdjusted, builder: (column) => column);

  GeneratedColumn<int> get outsideBoundary => $composableBuilder(
      column: $table.outsideBoundary, builder: (column) => column);

  GeneratedColumn<String> get capturedAt => $composableBuilder(
      column: $table.capturedAt, builder: (column) => column);

  GeneratedColumn<String> get clientDeviceInfo => $composableBuilder(
      column: $table.clientDeviceInfo, builder: (column) => column);

  GeneratedColumn<int> get version =>
      $composableBuilder(column: $table.version, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => column);

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$InspectionPointsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $InspectionPointsTable,
    InspectionPoint,
    $$InspectionPointsTableFilterComposer,
    $$InspectionPointsTableOrderingComposer,
    $$InspectionPointsTableAnnotationComposer,
    $$InspectionPointsTableCreateCompanionBuilder,
    $$InspectionPointsTableUpdateCompanionBuilder,
    (
      InspectionPoint,
      BaseReferences<_$AppDatabase, $InspectionPointsTable, InspectionPoint>
    ),
    InspectionPoint,
    PrefetchHooks Function()> {
  $$InspectionPointsTableTableManager(
      _$AppDatabase db, $InspectionPointsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$InspectionPointsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$InspectionPointsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$InspectionPointsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> clientUuid = const Value.absent(),
            Value<String?> serverId = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> category = const Value.absent(),
            Value<String?> note = const Value.absent(),
            Value<String?> remarks = const Value.absent(),
            Value<String?> recommendedProcedure = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<double> latitude = const Value.absent(),
            Value<double> longitude = const Value.absent(),
            Value<double?> accuracyM = const Value.absent(),
            Value<double?> altitudeM = const Value.absent(),
            Value<double?> headingDeg = const Value.absent(),
            Value<String?> locationSource = const Value.absent(),
            Value<int> locationAdjusted = const Value.absent(),
            Value<int> outsideBoundary = const Value.absent(),
            Value<String> capturedAt = const Value.absent(),
            Value<String?> clientDeviceInfo = const Value.absent(),
            Value<int> version = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            Value<String> createdAt = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              InspectionPointsCompanion(
            clientUuid: clientUuid,
            serverId: serverId,
            projectId: projectId,
            category: category,
            note: note,
            remarks: remarks,
            recommendedProcedure: recommendedProcedure,
            status: status,
            latitude: latitude,
            longitude: longitude,
            accuracyM: accuracyM,
            altitudeM: altitudeM,
            headingDeg: headingDeg,
            locationSource: locationSource,
            locationAdjusted: locationAdjusted,
            outsideBoundary: outsideBoundary,
            capturedAt: capturedAt,
            clientDeviceInfo: clientDeviceInfo,
            version: version,
            syncStatus: syncStatus,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String clientUuid,
            Value<String?> serverId = const Value.absent(),
            required String projectId,
            required String category,
            Value<String?> note = const Value.absent(),
            Value<String?> remarks = const Value.absent(),
            Value<String?> recommendedProcedure = const Value.absent(),
            Value<String> status = const Value.absent(),
            required double latitude,
            required double longitude,
            Value<double?> accuracyM = const Value.absent(),
            Value<double?> altitudeM = const Value.absent(),
            Value<double?> headingDeg = const Value.absent(),
            Value<String?> locationSource = const Value.absent(),
            Value<int> locationAdjusted = const Value.absent(),
            Value<int> outsideBoundary = const Value.absent(),
            required String capturedAt,
            Value<String?> clientDeviceInfo = const Value.absent(),
            Value<int> version = const Value.absent(),
            required String syncStatus,
            Value<String?> lastError = const Value.absent(),
            required String createdAt,
            required String updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              InspectionPointsCompanion.insert(
            clientUuid: clientUuid,
            serverId: serverId,
            projectId: projectId,
            category: category,
            note: note,
            remarks: remarks,
            recommendedProcedure: recommendedProcedure,
            status: status,
            latitude: latitude,
            longitude: longitude,
            accuracyM: accuracyM,
            altitudeM: altitudeM,
            headingDeg: headingDeg,
            locationSource: locationSource,
            locationAdjusted: locationAdjusted,
            outsideBoundary: outsideBoundary,
            capturedAt: capturedAt,
            clientDeviceInfo: clientDeviceInfo,
            version: version,
            syncStatus: syncStatus,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$InspectionPointsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $InspectionPointsTable,
    InspectionPoint,
    $$InspectionPointsTableFilterComposer,
    $$InspectionPointsTableOrderingComposer,
    $$InspectionPointsTableAnnotationComposer,
    $$InspectionPointsTableCreateCompanionBuilder,
    $$InspectionPointsTableUpdateCompanionBuilder,
    (
      InspectionPoint,
      BaseReferences<_$AppDatabase, $InspectionPointsTable, InspectionPoint>
    ),
    InspectionPoint,
    PrefetchHooks Function()>;
typedef $$PhotosTableCreateCompanionBuilder = PhotosCompanion Function({
  required String clientUuid,
  Value<String?> serverId,
  required String pointClientUuid,
  required String projectId,
  required String localOriginalPath,
  required String localUploadPath,
  Value<String?> localThumbPath,
  required String sha256,
  required int byteSize,
  required String contentType,
  Value<int?> widthPx,
  Value<int?> heightPx,
  Value<String?> tusUrl,
  Value<int> tusOffset,
  Value<String?> uploadToken,
  Value<String?> tusUploadId,
  required String syncStatus,
  Value<double> progressPct,
  Value<String?> lastError,
  required String createdAt,
  required String updatedAt,
  Value<int> rowid,
});
typedef $$PhotosTableUpdateCompanionBuilder = PhotosCompanion Function({
  Value<String> clientUuid,
  Value<String?> serverId,
  Value<String> pointClientUuid,
  Value<String> projectId,
  Value<String> localOriginalPath,
  Value<String> localUploadPath,
  Value<String?> localThumbPath,
  Value<String> sha256,
  Value<int> byteSize,
  Value<String> contentType,
  Value<int?> widthPx,
  Value<int?> heightPx,
  Value<String?> tusUrl,
  Value<int> tusOffset,
  Value<String?> uploadToken,
  Value<String?> tusUploadId,
  Value<String> syncStatus,
  Value<double> progressPct,
  Value<String?> lastError,
  Value<String> createdAt,
  Value<String> updatedAt,
  Value<int> rowid,
});

class $$PhotosTableFilterComposer
    extends Composer<_$AppDatabase, $PhotosTable> {
  $$PhotosTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get serverId => $composableBuilder(
      column: $table.serverId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get pointClientUuid => $composableBuilder(
      column: $table.pointClientUuid,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get localOriginalPath => $composableBuilder(
      column: $table.localOriginalPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get localUploadPath => $composableBuilder(
      column: $table.localUploadPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get localThumbPath => $composableBuilder(
      column: $table.localThumbPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get sha256 => $composableBuilder(
      column: $table.sha256, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get byteSize => $composableBuilder(
      column: $table.byteSize, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contentType => $composableBuilder(
      column: $table.contentType, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get widthPx => $composableBuilder(
      column: $table.widthPx, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get heightPx => $composableBuilder(
      column: $table.heightPx, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tusUrl => $composableBuilder(
      column: $table.tusUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get tusOffset => $composableBuilder(
      column: $table.tusOffset, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get uploadToken => $composableBuilder(
      column: $table.uploadToken, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tusUploadId => $composableBuilder(
      column: $table.tusUploadId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get progressPct => $composableBuilder(
      column: $table.progressPct, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$PhotosTableOrderingComposer
    extends Composer<_$AppDatabase, $PhotosTable> {
  $$PhotosTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get serverId => $composableBuilder(
      column: $table.serverId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get pointClientUuid => $composableBuilder(
      column: $table.pointClientUuid,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get localOriginalPath => $composableBuilder(
      column: $table.localOriginalPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get localUploadPath => $composableBuilder(
      column: $table.localUploadPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get localThumbPath => $composableBuilder(
      column: $table.localThumbPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get sha256 => $composableBuilder(
      column: $table.sha256, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get byteSize => $composableBuilder(
      column: $table.byteSize, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contentType => $composableBuilder(
      column: $table.contentType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get widthPx => $composableBuilder(
      column: $table.widthPx, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get heightPx => $composableBuilder(
      column: $table.heightPx, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tusUrl => $composableBuilder(
      column: $table.tusUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get tusOffset => $composableBuilder(
      column: $table.tusOffset, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get uploadToken => $composableBuilder(
      column: $table.uploadToken, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tusUploadId => $composableBuilder(
      column: $table.tusUploadId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get progressPct => $composableBuilder(
      column: $table.progressPct, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$PhotosTableAnnotationComposer
    extends Composer<_$AppDatabase, $PhotosTable> {
  $$PhotosTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get clientUuid => $composableBuilder(
      column: $table.clientUuid, builder: (column) => column);

  GeneratedColumn<String> get serverId =>
      $composableBuilder(column: $table.serverId, builder: (column) => column);

  GeneratedColumn<String> get pointClientUuid => $composableBuilder(
      column: $table.pointClientUuid, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get localOriginalPath => $composableBuilder(
      column: $table.localOriginalPath, builder: (column) => column);

  GeneratedColumn<String> get localUploadPath => $composableBuilder(
      column: $table.localUploadPath, builder: (column) => column);

  GeneratedColumn<String> get localThumbPath => $composableBuilder(
      column: $table.localThumbPath, builder: (column) => column);

  GeneratedColumn<String> get sha256 =>
      $composableBuilder(column: $table.sha256, builder: (column) => column);

  GeneratedColumn<int> get byteSize =>
      $composableBuilder(column: $table.byteSize, builder: (column) => column);

  GeneratedColumn<String> get contentType => $composableBuilder(
      column: $table.contentType, builder: (column) => column);

  GeneratedColumn<int> get widthPx =>
      $composableBuilder(column: $table.widthPx, builder: (column) => column);

  GeneratedColumn<int> get heightPx =>
      $composableBuilder(column: $table.heightPx, builder: (column) => column);

  GeneratedColumn<String> get tusUrl =>
      $composableBuilder(column: $table.tusUrl, builder: (column) => column);

  GeneratedColumn<int> get tusOffset =>
      $composableBuilder(column: $table.tusOffset, builder: (column) => column);

  GeneratedColumn<String> get uploadToken => $composableBuilder(
      column: $table.uploadToken, builder: (column) => column);

  GeneratedColumn<String> get tusUploadId => $composableBuilder(
      column: $table.tusUploadId, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => column);

  GeneratedColumn<double> get progressPct => $composableBuilder(
      column: $table.progressPct, builder: (column) => column);

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$PhotosTableTableManager extends RootTableManager<
    _$AppDatabase,
    $PhotosTable,
    Photo,
    $$PhotosTableFilterComposer,
    $$PhotosTableOrderingComposer,
    $$PhotosTableAnnotationComposer,
    $$PhotosTableCreateCompanionBuilder,
    $$PhotosTableUpdateCompanionBuilder,
    (Photo, BaseReferences<_$AppDatabase, $PhotosTable, Photo>),
    Photo,
    PrefetchHooks Function()> {
  $$PhotosTableTableManager(_$AppDatabase db, $PhotosTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PhotosTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PhotosTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PhotosTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> clientUuid = const Value.absent(),
            Value<String?> serverId = const Value.absent(),
            Value<String> pointClientUuid = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> localOriginalPath = const Value.absent(),
            Value<String> localUploadPath = const Value.absent(),
            Value<String?> localThumbPath = const Value.absent(),
            Value<String> sha256 = const Value.absent(),
            Value<int> byteSize = const Value.absent(),
            Value<String> contentType = const Value.absent(),
            Value<int?> widthPx = const Value.absent(),
            Value<int?> heightPx = const Value.absent(),
            Value<String?> tusUrl = const Value.absent(),
            Value<int> tusOffset = const Value.absent(),
            Value<String?> uploadToken = const Value.absent(),
            Value<String?> tusUploadId = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<double> progressPct = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            Value<String> createdAt = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              PhotosCompanion(
            clientUuid: clientUuid,
            serverId: serverId,
            pointClientUuid: pointClientUuid,
            projectId: projectId,
            localOriginalPath: localOriginalPath,
            localUploadPath: localUploadPath,
            localThumbPath: localThumbPath,
            sha256: sha256,
            byteSize: byteSize,
            contentType: contentType,
            widthPx: widthPx,
            heightPx: heightPx,
            tusUrl: tusUrl,
            tusOffset: tusOffset,
            uploadToken: uploadToken,
            tusUploadId: tusUploadId,
            syncStatus: syncStatus,
            progressPct: progressPct,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String clientUuid,
            Value<String?> serverId = const Value.absent(),
            required String pointClientUuid,
            required String projectId,
            required String localOriginalPath,
            required String localUploadPath,
            Value<String?> localThumbPath = const Value.absent(),
            required String sha256,
            required int byteSize,
            required String contentType,
            Value<int?> widthPx = const Value.absent(),
            Value<int?> heightPx = const Value.absent(),
            Value<String?> tusUrl = const Value.absent(),
            Value<int> tusOffset = const Value.absent(),
            Value<String?> uploadToken = const Value.absent(),
            Value<String?> tusUploadId = const Value.absent(),
            required String syncStatus,
            Value<double> progressPct = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            required String createdAt,
            required String updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              PhotosCompanion.insert(
            clientUuid: clientUuid,
            serverId: serverId,
            pointClientUuid: pointClientUuid,
            projectId: projectId,
            localOriginalPath: localOriginalPath,
            localUploadPath: localUploadPath,
            localThumbPath: localThumbPath,
            sha256: sha256,
            byteSize: byteSize,
            contentType: contentType,
            widthPx: widthPx,
            heightPx: heightPx,
            tusUrl: tusUrl,
            tusOffset: tusOffset,
            uploadToken: uploadToken,
            tusUploadId: tusUploadId,
            syncStatus: syncStatus,
            progressPct: progressPct,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$PhotosTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $PhotosTable,
    Photo,
    $$PhotosTableFilterComposer,
    $$PhotosTableOrderingComposer,
    $$PhotosTableAnnotationComposer,
    $$PhotosTableCreateCompanionBuilder,
    $$PhotosTableUpdateCompanionBuilder,
    (Photo, BaseReferences<_$AppDatabase, $PhotosTable, Photo>),
    Photo,
    PrefetchHooks Function()>;
typedef $$OutboxTableCreateCompanionBuilder = OutboxCompanion Function({
  required String id,
  required String type,
  required String payloadJson,
  Value<String?> dependsOn,
  required int priority,
  required String status,
  Value<int> attempts,
  Value<String?> nextAttemptAt,
  Value<String?> lastError,
  required String createdAt,
  required String updatedAt,
  Value<int> rowid,
});
typedef $$OutboxTableUpdateCompanionBuilder = OutboxCompanion Function({
  Value<String> id,
  Value<String> type,
  Value<String> payloadJson,
  Value<String?> dependsOn,
  Value<int> priority,
  Value<String> status,
  Value<int> attempts,
  Value<String?> nextAttemptAt,
  Value<String?> lastError,
  Value<String> createdAt,
  Value<String> updatedAt,
  Value<int> rowid,
});

class $$OutboxTableFilterComposer
    extends Composer<_$AppDatabase, $OutboxTable> {
  $$OutboxTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get dependsOn => $composableBuilder(
      column: $table.dependsOn, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get priority => $composableBuilder(
      column: $table.priority, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get attempts => $composableBuilder(
      column: $table.attempts, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get nextAttemptAt => $composableBuilder(
      column: $table.nextAttemptAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$OutboxTableOrderingComposer
    extends Composer<_$AppDatabase, $OutboxTable> {
  $$OutboxTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get dependsOn => $composableBuilder(
      column: $table.dependsOn, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get priority => $composableBuilder(
      column: $table.priority, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get attempts => $composableBuilder(
      column: $table.attempts, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get nextAttemptAt => $composableBuilder(
      column: $table.nextAttemptAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$OutboxTableAnnotationComposer
    extends Composer<_$AppDatabase, $OutboxTable> {
  $$OutboxTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => column);

  GeneratedColumn<String> get dependsOn =>
      $composableBuilder(column: $table.dependsOn, builder: (column) => column);

  GeneratedColumn<int> get priority =>
      $composableBuilder(column: $table.priority, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get attempts =>
      $composableBuilder(column: $table.attempts, builder: (column) => column);

  GeneratedColumn<String> get nextAttemptAt => $composableBuilder(
      column: $table.nextAttemptAt, builder: (column) => column);

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$OutboxTableTableManager extends RootTableManager<
    _$AppDatabase,
    $OutboxTable,
    OutboxData,
    $$OutboxTableFilterComposer,
    $$OutboxTableOrderingComposer,
    $$OutboxTableAnnotationComposer,
    $$OutboxTableCreateCompanionBuilder,
    $$OutboxTableUpdateCompanionBuilder,
    (OutboxData, BaseReferences<_$AppDatabase, $OutboxTable, OutboxData>),
    OutboxData,
    PrefetchHooks Function()> {
  $$OutboxTableTableManager(_$AppDatabase db, $OutboxTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OutboxTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OutboxTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OutboxTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String> payloadJson = const Value.absent(),
            Value<String?> dependsOn = const Value.absent(),
            Value<int> priority = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> attempts = const Value.absent(),
            Value<String?> nextAttemptAt = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            Value<String> createdAt = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OutboxCompanion(
            id: id,
            type: type,
            payloadJson: payloadJson,
            dependsOn: dependsOn,
            priority: priority,
            status: status,
            attempts: attempts,
            nextAttemptAt: nextAttemptAt,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String type,
            required String payloadJson,
            Value<String?> dependsOn = const Value.absent(),
            required int priority,
            required String status,
            Value<int> attempts = const Value.absent(),
            Value<String?> nextAttemptAt = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            required String createdAt,
            required String updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              OutboxCompanion.insert(
            id: id,
            type: type,
            payloadJson: payloadJson,
            dependsOn: dependsOn,
            priority: priority,
            status: status,
            attempts: attempts,
            nextAttemptAt: nextAttemptAt,
            lastError: lastError,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$OutboxTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $OutboxTable,
    OutboxData,
    $$OutboxTableFilterComposer,
    $$OutboxTableOrderingComposer,
    $$OutboxTableAnnotationComposer,
    $$OutboxTableCreateCompanionBuilder,
    $$OutboxTableUpdateCompanionBuilder,
    (OutboxData, BaseReferences<_$AppDatabase, $OutboxTable, OutboxData>),
    OutboxData,
    PrefetchHooks Function()>;
typedef $$SyncStateTableCreateCompanionBuilder = SyncStateCompanion Function({
  required String key,
  Value<String?> cursorUpdatedAt,
  Value<String?> cursorId,
  Value<String?> serverTime,
  required String updatedAt,
  Value<int> rowid,
});
typedef $$SyncStateTableUpdateCompanionBuilder = SyncStateCompanion Function({
  Value<String> key,
  Value<String?> cursorUpdatedAt,
  Value<String?> cursorId,
  Value<String?> serverTime,
  Value<String> updatedAt,
  Value<int> rowid,
});

class $$SyncStateTableFilterComposer
    extends Composer<_$AppDatabase, $SyncStateTable> {
  $$SyncStateTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get cursorUpdatedAt => $composableBuilder(
      column: $table.cursorUpdatedAt,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get cursorId => $composableBuilder(
      column: $table.cursorId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get serverTime => $composableBuilder(
      column: $table.serverTime, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$SyncStateTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncStateTable> {
  $$SyncStateTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get cursorUpdatedAt => $composableBuilder(
      column: $table.cursorUpdatedAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get cursorId => $composableBuilder(
      column: $table.cursorId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get serverTime => $composableBuilder(
      column: $table.serverTime, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$SyncStateTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncStateTable> {
  $$SyncStateTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get cursorUpdatedAt => $composableBuilder(
      column: $table.cursorUpdatedAt, builder: (column) => column);

  GeneratedColumn<String> get cursorId =>
      $composableBuilder(column: $table.cursorId, builder: (column) => column);

  GeneratedColumn<String> get serverTime => $composableBuilder(
      column: $table.serverTime, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$SyncStateTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SyncStateTable,
    SyncStateData,
    $$SyncStateTableFilterComposer,
    $$SyncStateTableOrderingComposer,
    $$SyncStateTableAnnotationComposer,
    $$SyncStateTableCreateCompanionBuilder,
    $$SyncStateTableUpdateCompanionBuilder,
    (
      SyncStateData,
      BaseReferences<_$AppDatabase, $SyncStateTable, SyncStateData>
    ),
    SyncStateData,
    PrefetchHooks Function()> {
  $$SyncStateTableTableManager(_$AppDatabase db, $SyncStateTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncStateTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncStateTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncStateTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> key = const Value.absent(),
            Value<String?> cursorUpdatedAt = const Value.absent(),
            Value<String?> cursorId = const Value.absent(),
            Value<String?> serverTime = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SyncStateCompanion(
            key: key,
            cursorUpdatedAt: cursorUpdatedAt,
            cursorId: cursorId,
            serverTime: serverTime,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String key,
            Value<String?> cursorUpdatedAt = const Value.absent(),
            Value<String?> cursorId = const Value.absent(),
            Value<String?> serverTime = const Value.absent(),
            required String updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              SyncStateCompanion.insert(
            key: key,
            cursorUpdatedAt: cursorUpdatedAt,
            cursorId: cursorId,
            serverTime: serverTime,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SyncStateTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SyncStateTable,
    SyncStateData,
    $$SyncStateTableFilterComposer,
    $$SyncStateTableOrderingComposer,
    $$SyncStateTableAnnotationComposer,
    $$SyncStateTableCreateCompanionBuilder,
    $$SyncStateTableUpdateCompanionBuilder,
    (
      SyncStateData,
      BaseReferences<_$AppDatabase, $SyncStateTable, SyncStateData>
    ),
    SyncStateData,
    PrefetchHooks Function()>;
typedef $$MapRegionsTableCreateCompanionBuilder = MapRegionsCompanion Function({
  required String id,
  required String projectId,
  required int minZoom,
  required int maxZoom,
  required String boundsGeojson,
  required String status,
  Value<int?> bytes,
  required String updatedAt,
  Value<int> rowid,
});
typedef $$MapRegionsTableUpdateCompanionBuilder = MapRegionsCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<int> minZoom,
  Value<int> maxZoom,
  Value<String> boundsGeojson,
  Value<String> status,
  Value<int?> bytes,
  Value<String> updatedAt,
  Value<int> rowid,
});

class $$MapRegionsTableFilterComposer
    extends Composer<_$AppDatabase, $MapRegionsTable> {
  $$MapRegionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get minZoom => $composableBuilder(
      column: $table.minZoom, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get maxZoom => $composableBuilder(
      column: $table.maxZoom, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get boundsGeojson => $composableBuilder(
      column: $table.boundsGeojson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get bytes => $composableBuilder(
      column: $table.bytes, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$MapRegionsTableOrderingComposer
    extends Composer<_$AppDatabase, $MapRegionsTable> {
  $$MapRegionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get minZoom => $composableBuilder(
      column: $table.minZoom, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get maxZoom => $composableBuilder(
      column: $table.maxZoom, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get boundsGeojson => $composableBuilder(
      column: $table.boundsGeojson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get bytes => $composableBuilder(
      column: $table.bytes, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$MapRegionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $MapRegionsTable> {
  $$MapRegionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<int> get minZoom =>
      $composableBuilder(column: $table.minZoom, builder: (column) => column);

  GeneratedColumn<int> get maxZoom =>
      $composableBuilder(column: $table.maxZoom, builder: (column) => column);

  GeneratedColumn<String> get boundsGeojson => $composableBuilder(
      column: $table.boundsGeojson, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get bytes =>
      $composableBuilder(column: $table.bytes, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$MapRegionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $MapRegionsTable,
    MapRegion,
    $$MapRegionsTableFilterComposer,
    $$MapRegionsTableOrderingComposer,
    $$MapRegionsTableAnnotationComposer,
    $$MapRegionsTableCreateCompanionBuilder,
    $$MapRegionsTableUpdateCompanionBuilder,
    (MapRegion, BaseReferences<_$AppDatabase, $MapRegionsTable, MapRegion>),
    MapRegion,
    PrefetchHooks Function()> {
  $$MapRegionsTableTableManager(_$AppDatabase db, $MapRegionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$MapRegionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$MapRegionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$MapRegionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<int> minZoom = const Value.absent(),
            Value<int> maxZoom = const Value.absent(),
            Value<String> boundsGeojson = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int?> bytes = const Value.absent(),
            Value<String> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              MapRegionsCompanion(
            id: id,
            projectId: projectId,
            minZoom: minZoom,
            maxZoom: maxZoom,
            boundsGeojson: boundsGeojson,
            status: status,
            bytes: bytes,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required int minZoom,
            required int maxZoom,
            required String boundsGeojson,
            required String status,
            Value<int?> bytes = const Value.absent(),
            required String updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              MapRegionsCompanion.insert(
            id: id,
            projectId: projectId,
            minZoom: minZoom,
            maxZoom: maxZoom,
            boundsGeojson: boundsGeojson,
            status: status,
            bytes: bytes,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$MapRegionsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $MapRegionsTable,
    MapRegion,
    $$MapRegionsTableFilterComposer,
    $$MapRegionsTableOrderingComposer,
    $$MapRegionsTableAnnotationComposer,
    $$MapRegionsTableCreateCompanionBuilder,
    $$MapRegionsTableUpdateCompanionBuilder,
    (MapRegion, BaseReferences<_$AppDatabase, $MapRegionsTable, MapRegion>),
    MapRegion,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$UsersLocalTableTableManager get usersLocal =>
      $$UsersLocalTableTableManager(_db, _db.usersLocal);
  $$ProjectsTableTableManager get projects =>
      $$ProjectsTableTableManager(_db, _db.projects);
  $$InspectionPointsTableTableManager get inspectionPoints =>
      $$InspectionPointsTableTableManager(_db, _db.inspectionPoints);
  $$PhotosTableTableManager get photos =>
      $$PhotosTableTableManager(_db, _db.photos);
  $$OutboxTableTableManager get outbox =>
      $$OutboxTableTableManager(_db, _db.outbox);
  $$SyncStateTableTableManager get syncState =>
      $$SyncStateTableTableManager(_db, _db.syncState);
  $$MapRegionsTableTableManager get mapRegions =>
      $$MapRegionsTableTableManager(_db, _db.mapRegions);
}
