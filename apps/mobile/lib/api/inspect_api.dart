import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiException implements Exception {
  ApiException(this.status, this.code, this.message);
  final int status;
  final String? code;
  final String message;

  @override
  String toString() => 'ApiException($status, $code, $message)';
}

class SessionPayload {
  SessionPayload({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final PublicUser user;

  factory SessionPayload.fromJson(Map<String, dynamic> json) {
    return SessionPayload(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      user: PublicUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class PublicUser {
  PublicUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.tokenVersion,
  });

  final String id;
  final String email;
  final String fullName;
  final String role;
  final int tokenVersion;

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String? ?? '',
      role: json['role'] as String,
      tokenVersion: (json['token_version'] as num?)?.toInt() ?? 1,
    );
  }
}

class MePayload {
  MePayload({required this.user, required this.minAppVersion, required this.serverTime});
  final PublicUser user;
  final String minAppVersion;
  final String serverTime;

  factory MePayload.fromJson(Map<String, dynamic> json) {
    return MePayload(
      user: PublicUser.fromJson(json['user'] as Map<String, dynamic>),
      minAppVersion: json['min_app_version'] as String,
      serverTime: json['server_time'] as String,
    );
  }
}

class ProjectDto {
  ProjectDto({
    required this.id,
    required this.name,
    this.code,
    this.description,
    required this.isArchived,
    required this.updatedAt,
    this.boundary,
    this.bbox,
  });

  final String id;
  final String name;
  final String? code;
  final String? description;
  final bool isArchived;
  final String updatedAt;
  final Map<String, dynamic>? boundary;
  final Map<String, dynamic>? bbox;

  factory ProjectDto.fromJson(Map<String, dynamic> json) {
    return ProjectDto(
      id: json['id'] as String,
      name: json['name'] as String,
      code: json['code'] as String?,
      description: json['description'] as String?,
      isArchived: json['is_archived'] as bool? ?? false,
      updatedAt: json['updated_at'] as String? ?? '',
      boundary: json['boundary'] as Map<String, dynamic>?,
      bbox: json['bbox'] as Map<String, dynamic>?,
    );
  }
}

class DeltaPage {
  DeltaPage({
    required this.serverTime,
    required this.items,
    required this.deletedIds,
    this.nextCursor,
    required this.hasMore,
  });

  final String serverTime;
  final List<ProjectDto> items;
  final List<String> deletedIds;
  final Map<String, String>? nextCursor;
  final bool hasMore;

  factory DeltaPage.fromJson(Map<String, dynamic> json) {
    final cursor = json['next_cursor'];
    return DeltaPage(
      serverTime: json['server_time'] as String? ?? '',
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => ProjectDto.fromJson(e as Map<String, dynamic>))
          .toList(),
      deletedIds: (json['deleted_ids'] as List<dynamic>? ?? []).cast<String>(),
      nextCursor: cursor is Map<String, dynamic>
          ? {
              'since_updated_at': cursor['since_updated_at'] as String,
              'since_id': cursor['since_id'] as String,
            }
          : null,
      hasMore: json['has_more'] as bool? ?? false,
    );
  }
}

typedef HttpFn = Future<http.Response> Function(
  String method,
  Uri uri, {
  Map<String, String>? headers,
  Object? body,
});

class InspectApi {
  InspectApi({
    required this.baseUrl,
    required this.readAccessToken,
    HttpFn? send,
  }) : _send = send ?? _defaultSend;

  /// Origin only, e.g. `http://127.0.0.1:3001`.
  final String baseUrl;
  final Future<String?> Function() readAccessToken;
  final HttpFn _send;

  static Future<http.Response> _defaultSend(
    String method,
    Uri uri, {
    Map<String, String>? headers,
    Object? body,
  }) {
    const timeout = Duration(seconds: 15);
    switch (method) {
      case 'GET':
        return http.get(uri, headers: headers).timeout(timeout);
      case 'POST':
        return http.post(uri, headers: headers, body: body).timeout(timeout);
      default:
        throw UnsupportedError('HTTP $method');
    }
  }

  Uri _u(String path, [Map<String, String>? query]) {
    final root = baseUrl.replaceAll(RegExp(r'/$'), '');
    return Uri.parse('$root/v1$path').replace(queryParameters: query);
  }

  Future<Map<String, dynamic>?> _json(
    String method,
    String path, {
    Object? body,
    bool auth = true,
    Map<String, String>? query,
  }) async {
    final headers = <String, String>{};
    if (body != null) headers['content-type'] = 'application/json';
    if (auth) {
      final token = await readAccessToken();
      if (token != null) headers['authorization'] = 'Bearer $token';
    }
    final res = await _send(
      method,
      _u(path, query),
      headers: headers,
      body: body == null ? null : jsonEncode(body),
    );
    if (res.statusCode == 204) return null;
    final decoded = res.body.isEmpty ? null : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final err = decoded is Map<String, dynamic> ? decoded['error'] : null;
      throw ApiException(
        res.statusCode,
        err is Map<String, dynamic> ? err['code'] as String? : null,
        err is Map<String, dynamic>
            ? err['message'] as String? ?? res.reasonPhrase ?? 'error'
            : res.reasonPhrase ?? 'error',
      );
    }
    return decoded as Map<String, dynamic>?;
  }

  Future<SessionPayload> login(String email, String password) async {
    final json = await _json(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
      auth: false,
    );
    return SessionPayload.fromJson(json!);
  }

  Future<SessionPayload> refresh(String refreshToken) async {
    final json = await _json(
      'POST',
      '/auth/refresh',
      body: {'refresh_token': refreshToken},
      auth: false,
    );
    return SessionPayload.fromJson(json!);
  }

  Future<void> logout(String refreshToken) async {
    try {
      await _json('POST', '/auth/logout', body: {'refresh_token': refreshToken}, auth: false);
    } on ApiException {
      // already gone
    }
  }

  Future<MePayload> me() async {
    final json = await _json('GET', '/auth/me');
    return MePayload.fromJson(json!);
  }

  Future<DeltaPage> syncProjects({String? sinceUpdatedAt, String? sinceId, int? limit}) {
    final query = <String, String>{};
    if (sinceUpdatedAt != null) query['since_updated_at'] = sinceUpdatedAt;
    if (sinceId != null) query['since_id'] = sinceId;
    if (limit != null) query['limit'] = '$limit';
    return _json('GET', '/sync/projects', query: query.isEmpty ? null : query)
        .then((json) => DeltaPage.fromJson(json!));
  }

  Future<Map<String, dynamic>> createInspectionPoint(Map<String, Object?> body) async {
    final json = await _json('POST', '/inspection-points', body: body);
    return json!;
  }

  Future<Map<String, dynamic>> registerPhoto(Map<String, Object?> body) async {
    final json = await _json('POST', '/photos', body: body);
    return json!;
  }

  Future<Map<String, dynamic>> getPhoto(String id) async {
    final json = await _json('GET', '/photos/$id');
    return json!;
  }

  Future<Map<String, dynamic>> syncProjectPoints(
    String projectId, {
    String? sinceUpdatedAt,
    String? sinceId,
    int? limit,
  }) async {
    final query = <String, String>{};
    if (sinceUpdatedAt != null) query['since_updated_at'] = sinceUpdatedAt;
    if (sinceId != null) query['since_id'] = sinceId;
    if (limit != null) query['limit'] = '$limit';
    final json = await _json(
      'GET',
      '/sync/projects/$projectId/points',
      query: query.isEmpty ? null : query,
    );
    return json!;
  }
}
