const maxOutboxAttempts = 25;
const maxBackoff = Duration(minutes: 15);
const tusChunkBytes = 2 * 1024 * 1024;
const archivedCode = 'PROJECT_ARCHIVED';

Duration backoffFor(int attempts, {int jitterMs = 0}) {
  final expSeconds = 1 << attempts.clamp(0, 16);
  final raw = Duration(seconds: expSeconds) + Duration(milliseconds: jitterMs.clamp(0, 3000));
  return raw > maxBackoff ? maxBackoff : raw;
}

bool shouldSyncNow({required bool wifiOnly, required bool online, required bool wifi}) {
  if (!online) return false;
  if (wifiOnly && !wifi) return false;
  return true;
}

bool isRetryableError(String? code) => code != archivedCode;

abstract class NetworkStatus {
  Future<bool> get isOnline;
  Future<bool> get isWifi;
}

class AlwaysOnNetwork implements NetworkStatus {
  const AlwaysOnNetwork();
  @override
  Future<bool> get isOnline async => true;
  @override
  Future<bool> get isWifi async => true;
}
