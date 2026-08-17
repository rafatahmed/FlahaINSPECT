import 'dart:io';
import 'dart:typed_data';

import 'package:flaha_inspect/capture/ports.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

class IoPhotoFiles implements PhotoFiles {
  @override
  Future<PhotoPaths> write({
    required String projectId,
    required String photoUuid,
    required Uint8List original,
    required Uint8List upload,
    required Uint8List thumb,
  }) async {
    final root = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(root.path, 'photos', projectId));
    await dir.create(recursive: true);
    final originalPath = p.join(dir.path, '${photoUuid}_original.jpg');
    final uploadPath = p.join(dir.path, '${photoUuid}_upload.jpg');
    final thumbPath = p.join(dir.path, '${photoUuid}_thumb.jpg');
    await File(originalPath).writeAsBytes(original, flush: true);
    await File(uploadPath).writeAsBytes(upload, flush: true);
    await File(thumbPath).writeAsBytes(thumb, flush: true);
    return PhotoPaths(original: originalPath, upload: uploadPath, thumb: thumbPath);
  }

  @override
  Future<Uint8List> readUpload(String path) => File(path).readAsBytes();
}
