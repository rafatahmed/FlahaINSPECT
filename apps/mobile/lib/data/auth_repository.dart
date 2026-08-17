import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/auth/min_app_version.dart';
import 'package:flaha_inspect/auth/session_store.dart';
import 'package:flaha_inspect/db/app_database.dart';
import 'package:drift/drift.dart';

class UpdateRequiredException implements Exception {
  UpdateRequiredException(this.minimum);
  final String minimum;
}

abstract class AuthGateway {
  Future<void> login(String email, String password);
  Future<bool> restore();
  Future<void> logout();
}

class AuthRepository implements AuthGateway {
  AuthRepository({
    required this.db,
    required this.api,
    required this.session,
    required this.appVersion,
  });

  final AppDatabase db;
  final InspectApi api;
  final SessionStore session;
  final String appVersion;

  Future<bool> hasSession() async {
    final token = await session.readAccessToken();
    return token != null && token.isNotEmpty;
  }

  @override
  Future<void> login(String email, String password) async {
    final payload = await api.login(email.trim(), password);
    await session.save(accessToken: payload.accessToken, refreshToken: payload.refreshToken);
    await _upsertUser(payload.user);
    await _assertMinVersion();
  }

  @override
  Future<bool> restore() async {
    if (!await hasSession()) return false;
    try {
      await _assertMinVersion();
      return true;
    } on UpdateRequiredException {
      rethrow;
    } on ApiException catch (err) {
      if (err.status != 401) rethrow;
      final refresh = await session.readRefreshToken();
      if (refresh == null) {
        await logout();
        return false;
      }
      try {
        final payload = await api.refresh(refresh);
        await session.save(
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        );
        await _upsertUser(payload.user);
        await _assertMinVersion();
        return true;
      } on ApiException {
        await logout();
        return false;
      }
    }
  }

  @override
  Future<void> logout() async {
    final refresh = await session.readRefreshToken();
    if (refresh != null) {
      await api.logout(refresh);
    }
    await session.clear();
  }

  Future<void> _assertMinVersion() async {
    final me = await api.me();
    await _upsertUser(me.user);
    if (!isAppVersionSupported(appVersion, me.minAppVersion)) {
      throw UpdateRequiredException(me.minAppVersion);
    }
  }

  Future<void> _upsertUser(PublicUser user) {
    return db.into(db.usersLocal).insertOnConflictUpdate(
          UsersLocalCompanion(
            id: Value(user.id),
            email: Value(user.email),
            fullName: Value(user.fullName),
            role: Value(user.role),
            tokenVersion: Value(user.tokenVersion),
            lastAuthAt: Value(DateTime.now().millisecondsSinceEpoch),
          ),
        );
  }
}
