const osmTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const defaultAttribution = '© OpenStreetMap contributors';
const defaultUserAgent = 'FlahaINSPECT/1.0';

class TilePolicy {
  const TilePolicy({
    required this.urlTemplate,
    required this.attribution,
    required this.userAgent,
    required this.allowBulkDownload,
    required this.tilesAvailable,
    required this.usesPublicOsm,
  });

  final String urlTemplate;
  final String attribution;
  final String userAgent;
  final bool allowBulkDownload;
  final bool tilesAvailable;
  final bool usesPublicOsm;
}

/// KD-35 / G-01: public OSM is ambient-only (dev). Bulk download needs a licensed URL.
TilePolicy resolveTilePolicy({
  required String? providerUrl,
  String attribution = defaultAttribution,
  String userAgent = defaultUserAgent,
  bool isDev = false,
}) {
  final configured = providerUrl?.trim();
  final hasLicensed = configured != null && configured.isNotEmpty;
  final url = hasLicensed ? configured : (isDev ? osmTemplate : '');
  final osm = url.contains('openstreetmap.org') || url.contains('tile.openstreetmap');
  return TilePolicy(
    urlTemplate: url,
    attribution: attribution,
    userAgent: userAgent,
    allowBulkDownload: hasLicensed && !osm,
    tilesAvailable: url.isNotEmpty,
    usesPublicOsm: osm,
  );
}
