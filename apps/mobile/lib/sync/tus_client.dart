import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

class TusException implements Exception {
  TusException(this.status, this.message);
  final int status;
  final String message;
  @override
  String toString() => 'TusException($status, $message)';
}

typedef TusSend = Future<http.Response> Function(
  String method,
  Uri uri, {
  Map<String, String>? headers,
  List<int>? body,
});

/// tus 1.0.0: create + HEAD offset + PATCH chunks (2 MiB).
class TusClient {
  TusClient({TusSend? send}) : _send = send ?? _defaultSend;

  final TusSend _send;

  static Future<http.Response> _defaultSend(
    String method,
    Uri uri, {
    Map<String, String>? headers,
    List<int>? body,
  }) {
    switch (method) {
      case 'POST':
        return http.post(uri, headers: headers, body: body);
      case 'HEAD':
        return http.head(uri, headers: headers);
      case 'PATCH':
        return http.patch(uri, headers: headers, body: body);
      default:
        throw UnsupportedError(method);
    }
  }

  static String metadata(Map<String, String> values) {
    return values.entries
        .map((e) => '${e.key} ${base64.encode(utf8.encode(e.value))}')
        .join(',');
  }

  Future<Uri> create({
    required Uri endpoint,
    required int length,
    required String uploadToken,
    required Map<String, String> meta,
  }) async {
    final res = await _send(
      'POST',
      endpoint,
      headers: {
        'Tus-Resumable': '1.0.0',
        'Upload-Length': '$length',
        'Upload-Metadata': metadata(meta),
        'Authorization': 'Bearer $uploadToken',
      },
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw TusException(res.statusCode, 'tus create failed');
    }
    final loc = res.headers['location'];
    if (loc == null || loc.isEmpty) {
      throw TusException(res.statusCode, 'tus create missing Location');
    }
    return endpoint.resolve(loc);
  }

  Future<int> offset(Uri url, String uploadToken) async {
    final res = await _send(
      'HEAD',
      url,
      headers: {
        'Tus-Resumable': '1.0.0',
        'Authorization': 'Bearer $uploadToken',
      },
    );
    if (res.statusCode >= 400) {
      throw TusException(res.statusCode, 'tus head failed');
    }
    return int.tryParse(res.headers['upload-offset'] ?? '0') ?? 0;
  }

  Future<int> patch({
    required Uri url,
    required String uploadToken,
    required int offset,
    required Uint8List chunk,
  }) async {
    final res = await _send(
      'PATCH',
      url,
      headers: {
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': '$offset',
        'Content-Type': 'application/offset+octet-stream',
        'Authorization': 'Bearer $uploadToken',
      },
      body: chunk,
    );
    if (res.statusCode != 204 && res.statusCode != 200) {
      throw TusException(res.statusCode, 'tus patch failed');
    }
    return int.tryParse(res.headers['upload-offset'] ?? '${offset + chunk.length}') ??
        offset + chunk.length;
  }

  /// Resume from HEAD, then PATCH remaining bytes in 2 MiB chunks.
  Future<void> uploadAll({
    required Uri url,
    required String uploadToken,
    required Uint8List bytes,
    required Future<void> Function(int sent, int total) onProgress,
    int chunkSize = 2 * 1024 * 1024,
  }) async {
    var off = await offset(url, uploadToken);
    await onProgress(off, bytes.length);
    while (off < bytes.length) {
      final end = (off + chunkSize > bytes.length) ? bytes.length : off + chunkSize;
      off = await patch(
        url: url,
        uploadToken: uploadToken,
        offset: off,
        chunk: Uint8List.sublistView(bytes, off, end),
      );
      await onProgress(off, bytes.length);
    }
  }
}
