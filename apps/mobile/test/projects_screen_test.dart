import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/features/projects/projects_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeCatalog implements ProjectCatalog {
  _FakeCatalog(this.items);
  final List<ProjectListItem> items;

  @override
  Future<void> pullAll() async {}

  @override
  Future<List<ProjectListItem>> listLocal() async => items;
}

void main() {
  testWidgets('empty assigned list uses locked copy', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ProjectsScreen(
          projects: _FakeCatalog(const []),
          online: false,
          onLogout: () {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text(noAssignedProjects), findsOneWidget);
    expect(find.textContaining('Offline'), findsOneWidget);
  });

  testWidgets('archived projects are read-only', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ProjectsScreen(
          projects: _FakeCatalog([
            ProjectListItem(
              id: '1',
              name: 'Al Khor farm',
              isArchived: true,
              pointCount: 0,
              pendingCount: 0,
            ),
          ]),
          online: true,
          onLogout: () {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.textContaining('Al Khor farm'), findsOneWidget);
    expect(find.textContaining('ARCHIVED'), findsOneWidget);
    expect(find.text('Open'), findsNothing);
  });
}
