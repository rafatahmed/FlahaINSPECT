import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('generic failure does not reveal whether the email exists', () {
    expect(loginErrorMessage(), genericLoginFailure);
    expect(loginErrorMessage(code: 'UNAUTHORIZED'), genericLoginFailure);
  });

  test('ACCOUNT_LOCKED uses the locked copy', () {
    expect(loginErrorMessage(code: 'ACCOUNT_LOCKED'), accountLockedCopy);
  });

  test('product wordmark is FlahaINSPECT', () {
    expect(productName, 'FlahaINSPECT');
    expect(loginButtonLabel, 'Log in');
  });
}
