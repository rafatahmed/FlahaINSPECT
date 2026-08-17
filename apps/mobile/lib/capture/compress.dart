import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:image/image.dart' as img;

const uploadMaxEdge = 1920;
const uploadJpegQuality = 80;
const localThumbEdge = 512;

class UploadCandidate {
  const UploadCandidate({
    required this.bytes,
    required this.width,
    required this.height,
    required this.sha256,
    required this.thumbBytes,
  });

  final Uint8List bytes;
  final int width;
  final int height;
  final String sha256;
  final Uint8List thumbBytes;
}

/// Max-edge 1920 JPEG 80. Re-encode drops GPS/EXIF (KD-8 / KD-36).
UploadCandidate compressUploadCandidate(Uint8List original) {
  final decoded = img.decodeImage(original);
  if (decoded == null) {
    throw const FormatException('Could not decode photo');
  }
  var work = img.bakeOrientation(decoded);
  final longest = work.width > work.height ? work.width : work.height;
  if (longest > uploadMaxEdge) {
    work = img.copyResize(
      work,
      width: work.width >= work.height ? uploadMaxEdge : null,
      height: work.height > work.width ? uploadMaxEdge : null,
      interpolation: img.Interpolation.linear,
    );
  }
  final jpeg = Uint8List.fromList(img.encodeJpg(work, quality: uploadJpegQuality));
  var thumb = work;
  final thumbLong = thumb.width > thumb.height ? thumb.width : thumb.height;
  if (thumbLong > localThumbEdge) {
    thumb = img.copyResize(
      thumb,
      width: thumb.width >= thumb.height ? localThumbEdge : null,
      height: thumb.height > thumb.width ? localThumbEdge : null,
    );
  }
  final thumbJpeg = Uint8List.fromList(img.encodeJpg(thumb, quality: 70));
  return UploadCandidate(
    bytes: jpeg,
    width: work.width,
    height: work.height,
    sha256: sha256.convert(jpeg).toString(),
    thumbBytes: thumbJpeg,
  );
}
