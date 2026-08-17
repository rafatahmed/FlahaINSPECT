import 'package:flaha_inspect/l10n/locale_policy.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('UI stays English; Arabic is RTL-ready', () {
    expect(lockedUiLocale, const Locale('en'));
    expect(supportedAppLocales, contains(const Locale('ar')));
    expect(textDirectionFor(const Locale('en')), TextDirection.ltr);
    expect(textDirectionFor(const Locale('ar')), TextDirection.rtl);
    expect(isRtlLanguageCode('ar'), isTrue);
    expect(isRtlLanguageCode('en'), isFalse);
  });
}
