import 'package:flutter/widgets.dart';

/// EN is the locked UI locale (wireframe 01: no language toggle).
/// AR is listed so RTL and resource keys exist for R3 (G-09).
const lockedUiLocale = Locale('en');
const supportedAppLocales = [Locale('en'), Locale('ar')];

bool isRtlLanguageCode(String code) => code.toLowerCase() == 'ar';

TextDirection textDirectionFor(Locale locale) {
  return isRtlLanguageCode(locale.languageCode)
      ? TextDirection.rtl
      : TextDirection.ltr;
}
