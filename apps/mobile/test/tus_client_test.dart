import 'dart:typed_data';

import 'package:flaha_inspect/sync/tus_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;

void main() {
  test('uploadAll resumes from HEAD offset then PATCHes the rest', () async {
    final calls = <String>[];
    final client = TusClient(
      send: (method, uri, {headers, body}) async {
        calls.add(method);
        if (method == 'HEAD') {
          return http.Response('', 200, headers: {'upload-offset': '2'});
        }
        if (method == 'PATCH') {
          expect(headers!['Upload-Offset'], '2');
          expect(body, [2, 3]);
          return http.Response('', 204, headers: {'upload-offset': '4'});
        }
        return http.Response('', 500);
      },
    );
    final progress = <int>[];
    await client.uploadAll(
      url: Uri.parse('http://localhost/files/abc'),
      uploadToken: 'tok',
      bytes: Uint8List.fromList([0, 1, 2, 3]),
      chunkSize: 8,
      onProgress: (sent, total) async => progress.add(sent),
    );
    expect(calls, ['HEAD', 'PATCH']);
    expect(progress, [2, 4]);
  });
}
