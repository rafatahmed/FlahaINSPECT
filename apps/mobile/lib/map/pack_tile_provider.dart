import 'dart:io';

import 'package:flutter/painting.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:path/path.dart' as p;

/// Prefer Flaha pack files, then the network template.
class PackAwareTileProvider extends TileProvider {
  PackAwareTileProvider({this.packRoot});

  final String? packRoot;

  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) {
    final root = packRoot;
    if (root != null) {
      final file = File(p.join(root, '${coordinates.z}', '${coordinates.x}', '${coordinates.y}.png'));
      if (file.existsSync()) {
        return FileImage(file);
      }
    }
    return NetworkTileProvider().getImage(coordinates, options);
  }
}
