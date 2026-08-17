import 'package:flaha_inspect/app.dart';
import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/brand/brand_mark.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flutter_test/flutter_test.dart';

class _Auth implements AuthGateway {
  @override
  Future<void> login(String email, String password) async {}

  @override
  Future<void> logout() async {}

  @override
  Future<bool> restore() async => false;
}

class _Projects implements ProjectCatalog {
  @override
  Future<List<ProjectListItem>> listLocal() async => const [];

  @override
  Future<void> pullAll() async {}
}

void main() {
  testWidgets('cold start is the login screen', (tester) async {
    await tester.pumpWidget(
      FlahaInspectApp(auth: _Auth(), projects: _Projects()),
    );
    await tester.pumpAndSettle();
    expect(find.byType(BrandMark), findsOneWidget);
    expect(find.text(loginButtonLabel), findsOneWidget);
  });
}

