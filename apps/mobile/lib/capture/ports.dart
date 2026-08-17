import 'dart:typed_data';

abstract class PhotoSource {
  Future<Uint8List?> capture();
}

class PhotoPaths {
  const PhotoPaths({
    required this.original,
    required this.upload,
    required this.thumb,
  });

  final String original;
  final String upload;
  final String thumb;
}

abstract class PhotoFiles {
  Future<PhotoPaths> write({
    required String projectId,
    required String photoUuid,
    required Uint8List original,
    required Uint8List upload,
    required Uint8List thumb,
  });
}
