import 'dart:math' as math;

import 'package:flutter/material.dart';

/// High-contrast field palette (sun / dust). Large text on these pairs ≥ 3:1.
abstract final class FieldContrast {
  static const canvas = Color(0xFF101418);
  static const surface = Color(0xFF1C232B);
  static const onCanvas = Color(0xFFF5F7FA);
  static const muted = Color(0xFFD0D7DE);
  static const defect = Color(0xFFFF5252);
  static const normal = Color(0xFF69F0AE);
  static const note = Color(0xFFFFD740);
  static const warn = Color(0xFFFFC107);
  static const categoryMinHeight = 64.0;

  static Color categoryColor(String key) {
    switch (key) {
      case 'defect':
        return defect;
      case 'normal':
        return normal;
      case 'note':
        return note;
      default:
        return onCanvas;
    }
  }
}

double relativeLuminance(Color color) {
  double channel(double s) {
    return s <= 0.03928 ? s / 12.92 : math.pow((s + 0.055) / 1.055, 2.4).toDouble();
  }

  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

double contrastRatio(Color a, Color b) {
  final l1 = relativeLuminance(a);
  final l2 = relativeLuminance(b);
  final light = l1 > l2 ? l1 : l2;
  final dark = l1 > l2 ? l2 : l1;
  return (light + 0.05) / (dark + 0.05);
}
