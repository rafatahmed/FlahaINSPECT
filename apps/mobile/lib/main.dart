import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/app.dart';
import 'package:flaha_inspect/auth/secure_session_store.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/db/app_database.dart';
import 'package:flutter/material.dart';

const appVersion = '0.0.1';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3001',
  );
  final session = SecureSessionStore();
  final api = InspectApi(baseUrl: baseUrl, readAccessToken: session.readAccessToken);
  final db = AppDatabase();
  runApp(
    FlahaInspectApp(
      auth: AuthRepository(
        db: db,
        api: api,
        session: session,
        appVersion: appVersion,
      ),
      projects: ProjectRepository(db: db, api: api),
    ),
  );
}
