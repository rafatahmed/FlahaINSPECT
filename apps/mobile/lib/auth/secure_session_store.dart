import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'session_store.dart';

/// iOS Keychain / Android Keystore. Keys are not Drift columns (KD-37).
class SecureSessionStore implements SessionStore {
  SecureSessionStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const accessKey = 'flaha.access_token';
  static const refreshKey = 'flaha.refresh_token';

  final FlutterSecureStorage _storage;

  @override
  Future<void> save({required String accessToken, required String refreshToken}) async {
    await _storage.write(key: accessKey, value: accessToken);
    await _storage.write(key: refreshKey, value: refreshToken);
  }

  @override
  Future<String?> readAccessToken() => _storage.read(key: accessKey);

  @override
  Future<String?> readRefreshToken() => _storage.read(key: refreshKey);

  @override
  Future<void> clear() async {
    await _storage.delete(key: accessKey);
    await _storage.delete(key: refreshKey);
  }
}
