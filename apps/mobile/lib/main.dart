import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/app.dart';
import 'package:flaha_inspect/auth/secure_session_store.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flaha_inspect/data/capture_repository.dart';
import 'package:flaha_inspect/data/map_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/map/file_offline_packs.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flaha_inspect/db/app_database.dart';
import 'package:flaha_inspect/features/projects/project_home.dart';
import 'package:flaha_inspect/platform/device_ports.dart';
import 'package:flaha_inspect/platform/io_photo_files.dart';
import 'package:flaha_inspect/sync/outbox_worker.dart';
import 'package:flaha_inspect/sync/tus_client.dart';
import 'package:flutter/material.dart';

const appVersion = '0.0.1';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3001',
  );
  const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
  const tileUrl = String.fromEnvironment('TILE_PROVIDER_URL');
  const tileAttr = String.fromEnvironment(
    'TILE_PROVIDER_ATTRIBUTION',
    defaultValue: defaultAttribution,
  );
  const tileUa = String.fromEnvironment(
    'TILE_PROVIDER_USER_AGENT',
    defaultValue: defaultUserAgent,
  );
  final tiles = resolveTilePolicy(
    providerUrl: tileUrl,
    attribution: tileAttr,
    userAgent: tileUa,
    isDev: flavor != 'prod' && flavor != 'staging',
  );
  final session = SecureSessionStore();
  final api = InspectApi(baseUrl: baseUrl, readAccessToken: session.readAccessToken);
  final db = AppDatabase();
  final files = IoPhotoFiles();
  final worker = OutboxWorker(db: db, api: api, files: files, tus: TusClient());
  runApp(
    FlahaInspectApp(
      auth: AuthRepository(
        db: db,
        api: api,
        session: session,
        appVersion: appVersion,
      ),
      projects: ProjectRepository(db: db, api: api),
      capture: CaptureBindings(
        capture: CaptureRepository(db: db, files: files, appVersion: appVersion),
        location: GeolocatorSource(),
        photos: ImagePickerSource(),
        disk: UnknownDiskSpace(),
        sync: worker,
      ),
      maps: MapRepository(db),
      tiles: tiles,
      packs: FileOfflinePacks(),
    ),
  );
}
