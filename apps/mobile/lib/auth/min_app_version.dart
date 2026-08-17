/// Returns true when [current] >= [minimum] (semver major.minor.patch).
bool isAppVersionSupported(String current, String minimum) {
  return _tuple(current).compareTo(_tuple(minimum)) >= 0;
}

_Version _tuple(String raw) {
  final core = raw.split('+').first.split('-').first.trim();
  final parts = core.split('.');
  int n(int i) => i < parts.length ? int.tryParse(parts[i]) ?? 0 : 0;
  return _Version(n(0), n(1), n(2));
}

class _Version implements Comparable<_Version> {
  const _Version(this.major, this.minor, this.patch);
  final int major;
  final int minor;
  final int patch;

  @override
  int compareTo(_Version other) {
    if (major != other.major) return major.compareTo(other.major);
    if (minor != other.minor) return minor.compareTo(other.minor);
    return patch.compareTo(other.patch);
  }
}
