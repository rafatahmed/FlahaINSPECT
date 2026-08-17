const gpsSoftWarnMeters = 10.0;
const gpsAcquireTimeout = Duration(seconds: 15);

/// Non-blocking banner when accuracy is worse than 10 m (TDD / wireframe 04).
bool gpsNeedsSoftWarn(double? accuracyM) {
  if (accuracyM == null) return false;
  return accuracyM > gpsSoftWarnMeters;
}

class GeoFix {
  const GeoFix({
    required this.latitude,
    required this.longitude,
    this.accuracyM,
    this.altitudeM,
    this.headingDeg,
    this.source = 'phone_gps',
  });

  final double latitude;
  final double longitude;
  final double? accuracyM;
  final double? altitudeM;
  final double? headingDeg;
  final String source;

  GeoFix adjusted(double latitude, double longitude) {
    return GeoFix(
      latitude: latitude,
      longitude: longitude,
      accuracyM: accuracyM,
      altitudeM: altitudeM,
      headingDeg: headingDeg,
      source: source,
    );
  }
}

abstract class LocationSource {
  Future<GeoFix?> acquire({Duration timeout = gpsAcquireTimeout});
}
