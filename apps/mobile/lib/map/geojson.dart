import 'dart:convert';

class LatLngLite {
  const LatLngLite(this.latitude, this.longitude);
  final double latitude;
  final double longitude;
}

/// Reads a GeoJSON Polygon into a closed ring (lon/lat → lat/lng).
List<LatLngLite> polygonRing(String? geojson) {
  if (geojson == null || geojson.isEmpty) return const [];
  final decoded = jsonDecode(geojson);
  if (decoded is! Map<String, dynamic>) return const [];
  final coords = decoded['coordinates'];
  if (coords is! List || coords.isEmpty || coords.first is! List) return const [];
  final ring = coords.first as List<dynamic>;
  return [
    for (final c in ring)
      if (c is List && c.length >= 2) LatLngLite((c[1] as num).toDouble(), (c[0] as num).toDouble()),
  ];
}
