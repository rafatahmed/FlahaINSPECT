import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/theme/field_contrast.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('category colors on the field canvas meet large-text contrast', () {
    for (final key in ['defect', 'normal', 'note']) {
      final ratio = contrastRatio(FieldContrast.categoryColor(key), FieldContrast.canvas);
      expect(ratio, greaterThanOrEqualTo(3.0), reason: key);
    }
    expect(FieldContrast.categoryMinHeight, greaterThanOrEqualTo(64));
  });

  test('accuracy chrome is always a GPS label and warns above 10 m', () {
    expect(formatGpsAccuracy(null), 'GPS —');
    expect(formatGpsAccuracy(4.2), 'GPS 4.2 m');
    expect(gpsNeedsSoftWarn(4.2), isFalse);
    expect(gpsNeedsSoftWarn(10.1), isTrue);
  });
}
