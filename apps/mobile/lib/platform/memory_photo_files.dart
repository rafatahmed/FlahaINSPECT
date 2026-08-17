import 'dart:typed_data';

import 'package:flaha_inspect/capture/ports.dart';

class MemoryPhotoFiles implements PhotoFiles {
  final files = <String, Uint8List>{};

  @override
  Future<PhotoPaths> write({
    required String projectId,
    required String photoUuid,
    required Uint8List original,
    required Uint8List upload,
    required Uint8List thumb,
  }) async {
    final prefix = 'mem/$projectId/$photoUuid';
    files['$prefix/original.jpg'] = original;
    files['$prefix/upload.jpg'] = upload;
    files['$prefix/thumb.jpg'] = thumb;
    return PhotoPaths(
      original: '$prefix/original.jpg',
      upload: '$prefix/upload.jpg',
      thumb: '$prefix/thumb.jpg',
    );
  }

  @override
  Future<Uint8List> readUpload(String path) async {
    final bytes = files[path];
    if (bytes == null) throw StateError('missing $path');
    return bytes;
  }
}
