/// Never clobber local field columns while the point is still pending (TDD merge).
bool shouldApplyServerFields(String localSyncStatus) {
  return localSyncStatus != 'pending' && localSyncStatus != 'syncing';
}

class ServerPointDelta {
  const ServerPointDelta({
    required this.id,
    required this.clientUuid,
    required this.category,
    this.note,
    this.remarks,
    this.recommendedProcedure,
    required this.status,
    required this.version,
    required this.latitude,
    required this.longitude,
    this.photoStatus,
    this.photoServerId,
  });

  final String id;
  final String clientUuid;
  final String category;
  final String? note;
  final String? remarks;
  final String? recommendedProcedure;
  final String status;
  final int version;
  final double latitude;
  final double longitude;
  final String? photoStatus;
  final String? photoServerId;
}

class LocalPointDelta {
  const LocalPointDelta({
    required this.clientUuid,
    required this.syncStatus,
    required this.version,
  });

  final String clientUuid;
  final String syncStatus;
  final int version;
}

enum MergeAction { insert, applyDashboardOnly, applyAll, skip }

MergeAction mergePointAction(LocalPointDelta? local, ServerPointDelta server) {
  if (local == null) return MergeAction.insert;
  if (!shouldApplyServerFields(local.syncStatus)) return MergeAction.applyDashboardOnly;
  return MergeAction.applyAll;
}
