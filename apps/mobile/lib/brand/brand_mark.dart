import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flutter/material.dart';

enum BrandVariant { color, black, white }

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.variant = BrandVariant.color, this.height = 96});

  final BrandVariant variant;
  final double height;

  static const assets = {
    BrandVariant.color: 'assets/brand/logo-color.png',
    BrandVariant.black: 'assets/brand/logo-black.png',
    BrandVariant.white: 'assets/brand/logo-white.png',
  };

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      assets[variant]!,
      height: height,
      filterQuality: FilterQuality.high,
      semanticLabel: productName,
    );
  }
}
