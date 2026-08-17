import 'package:flaha_inspect/sync/delta_merge.dart';
import 'package:flaha_inspect/sync/sync_policy.dart';
import 'package:flaha_inspect/sync/tus_client.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Wi-Fi only skips cellular', () {
    expect(shouldSyncNow(wifiOnly: true, online: true, wifi: false), isFalse);
    expect(shouldSyncNow(wifiOnly: true, online: true, wifi: true), isTrue);
    expect(shouldSyncNow(wifiOnly: false, online: true, wifi: false), isTrue);
    expect(shouldSyncNow(wifiOnly: false, online: false, wifi: false), isFalse);
  });

  test('backoff is 2^attempts seconds, capped at 15 minutes', () {
    expect(backoffFor(0), const Duration(seconds: 1));
    expect(backoffFor(3), const Duration(seconds: 8));
    expect(backoffFor(20), maxBackoff);
    expect(backoffFor(3, jitterMs: 500).inMilliseconds, 8500);
  });

  test('PROJECT_ARCHIVED is not retryable', () {
    expect(isRetryableError(archivedCode), isFalse);
    expect(isRetryableError('DEPENDENCY_UNAVAILABLE'), isTrue);
  });

  test('pending local points only take dashboard fields from delta', () {
    expect(shouldApplyServerFields('pending'), isFalse);
    expect(shouldApplyServerFields('synced'), isTrue);
    const server = ServerPointDelta(
      id: 's',
      clientUuid: 'c',
      category: 'defect',
      status: 'open',
      version: 2,
      latitude: 1,
      longitude: 2,
    );
    expect(
      mergePointAction(const LocalPointDelta(clientUuid: 'c', syncStatus: 'pending', version: 1), server),
      MergeAction.applyDashboardOnly,
    );
  });

  test('TUS metadata is key + base64 pairs', () {
    final encoded = TusClient.metadata({'filetype': 'image/jpeg', 'photo_client_uuid': 'abc'});
    expect(encoded, contains('filetype'));
    expect(encoded, contains('photo_client_uuid'));
    expect(encoded.contains('image/jpeg'), isFalse);
  });
}
