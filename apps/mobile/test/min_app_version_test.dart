import 'package:flaha_inspect/auth/min_app_version.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('equal versions are supported', () {
    expect(isAppVersionSupported('0.0.1', '0.0.1'), isTrue);
  });

  test('older app is blocked', () {
    expect(isAppVersionSupported('0.0.1', '1.0.0'), isFalse);
  });

  test('newer app is allowed', () {
    expect(isAppVersionSupported('1.2.0', '1.1.9'), isTrue);
  });
}
