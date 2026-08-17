import 'package:flaha_inspect/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows the product name', (tester) async {
    await tester.pumpWidget(const FlahaInspectApp());
    expect(find.text('FlahaINSPECT'), findsOneWidget);
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
