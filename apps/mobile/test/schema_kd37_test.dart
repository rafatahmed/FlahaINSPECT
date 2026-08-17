import 'dart:io';

import 'package:flaha_inspect/db/tables.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('users_local has no session token columns (KD-37)', () {
    final src = File('lib/db/tables.dart').readAsStringSync();
    final users = src.split('class Projects').first;
    expect(users, contains('users_local'));
    expect(users, isNot(contains('accessToken')));
    expect(users, isNot(contains('refreshToken')));
    expect(users, isNot(contains('access_token')));
    expect(users, isNot(contains('refresh_token')));
  });

  test('outbox types are create-once only', () {
    expect(OutboxType.allowed, {
      OutboxType.createInspectionPoint,
      OutboxType.uploadPhoto,
    });
    expect(OutboxType.allowed.contains('UpdatePointLocal'), isFalse);
  });

  test('session tokens live in SecureSessionStore keys, not Drift', () {
    final store = File('lib/auth/secure_session_store.dart').readAsStringSync();
    expect(store, contains('flutter_secure_storage'));
    expect(store, contains('flaha.access_token'));
    expect(store, contains('flaha.refresh_token'));
  });
}
