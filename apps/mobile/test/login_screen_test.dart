import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flaha_inspect/features/login/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAuth implements AuthGateway {
  _FakeAuth(this._onLogin);
  final Future<void> Function(String, String) _onLogin;
  var loggedIn = false;

  @override
  Future<void> login(String email, String password) => _onLogin(email, password);

  @override
  Future<void> logout() async {}

  @override
  Future<bool> restore() async => false;
}

void main() {
  testWidgets('login chrome matches wireframe 01', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(
          auth: _FakeAuth((_, __) async {}),
          onLoggedIn: () {},
        ),
      ),
    );
    expect(find.text(productName), findsOneWidget);
    expect(find.text(loginButtonLabel), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.textContaining('Forgot'), findsNothing);
  });

  testWidgets('shows generic failure copy', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(
          auth: _FakeAuth(
            (_, __) async => throw ApiException(401, 'UNAUTHORIZED', 'nope'),
          ),
          onLoggedIn: () {},
        ),
      ),
    );
    await tester.enterText(find.byType(TextField).first, 'a@b.com');
    await tester.enterText(find.byType(TextField).last, 'secret');
    await tester.tap(find.text(loginButtonLabel));
    await tester.pumpAndSettle();
    expect(find.text(genericLoginFailure), findsOneWidget);
  });

  testWidgets('ACCOUNT_LOCKED shows 15-minute copy', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(
          auth: _FakeAuth(
            (_, __) async => throw ApiException(429, 'ACCOUNT_LOCKED', 'locked'),
          ),
          onLoggedIn: () {},
        ),
      ),
    );
    await tester.enterText(find.byType(TextField).first, 'a@b.com');
    await tester.enterText(find.byType(TextField).last, 'secret');
    await tester.tap(find.text(loginButtonLabel));
    await tester.pumpAndSettle();
    expect(find.text(accountLockedCopy), findsOneWidget);
  });
}
