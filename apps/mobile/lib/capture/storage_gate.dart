const storageWarnBytes = 500 * 1024 * 1024;
const storageBlockBytes = 200 * 1024 * 1024;

enum StorageVerdict { ok, warn, block }

StorageVerdict storageVerdict(int? freeBytes) {
  if (freeBytes == null) return StorageVerdict.ok;
  if (freeBytes < storageBlockBytes) return StorageVerdict.block;
  if (freeBytes < storageWarnBytes) return StorageVerdict.warn;
  return StorageVerdict.ok;
}

abstract class DiskSpace {
  Future<int?> freeBytes();
}
