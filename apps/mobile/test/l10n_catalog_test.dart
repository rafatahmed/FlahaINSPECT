import 'dart:convert';
import 'dart:io';

import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Map<String, dynamic> load(String name) {
    return jsonDecode(File('lib/l10n/$name').readAsStringSync()) as Map<String, dynamic>;
  }

  Set<String> keysOf(Map<String, dynamic> arb) {
    return arb.keys.where((k) => !k.startsWith('@')).toSet();
  }

  test('AR catalog has every EN key (G-09 scaffold, unused in UI)', () {
    final en = load('app_en.arb');
    final ar = load('app_ar.arb');
    expect(en['@@locale'], 'en');
    expect(ar['@@locale'], 'ar');
    expect(keysOf(ar), keysOf(en));
    expect(en['productName'], productName);
    expect(ar['productName'], productName);
    expect(en['loginButton'], loginButtonLabel);
    expect(en['genericLoginFailure'], genericLoginFailure);
    expect(en['gpsImprecise'], gpsImpreciseBanner);
    expect(en['categoryDefect'], 'Defect');
  });
}
