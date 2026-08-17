import 'package:flutter/material.dart';

const mapCategoryColors = {
  'defect': Color(0xFFE53935),
  'normal': Color(0xFF43A047),
  'note': Color(0xFFFDD835),
};

const mapCategoryLabels = {
  'defect': 'Defect',
  'normal': 'Normal',
  'note': 'Note',
};

Color colorForCategory(String category) =>
    mapCategoryColors[category] ?? const Color(0xFF757575);
