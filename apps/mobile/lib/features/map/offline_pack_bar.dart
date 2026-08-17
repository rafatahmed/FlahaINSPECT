import 'package:flaha_inspect/map/map_copy.dart';
import 'package:flaha_inspect/map/offline_pack.dart';
import 'package:flaha_inspect/map/offline_region.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter/material.dart';

class OfflinePackBar extends StatelessWidget {
  const OfflinePackBar({
    super.key,
    required this.tiles,
    required this.hasPack,
    required this.busy,
    required this.progress,
    required this.onDownload,
    required this.onDelete,
  });

  final TilePolicy tiles;
  final bool hasPack;
  final bool busy;
  final PackProgress? progress;
  final VoidCallback onDownload;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    if (!canBulkDownload(tiles)) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(
          tiles.usesPublicOsm ? osmBulkForbidden : setTileUrlFirst,
          textAlign: TextAlign.center,
        ),
      );
    }
    return Column(
      children: [
        if (busy && progress != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Column(
              children: [
                LinearProgressIndicator(value: progress!.fraction),
                const SizedBox(height: 4),
                Text('$downloadingMapLabel ${(progress!.fraction * 100).round()}%'),
              ],
            ),
          ),
        if (hasPack && !busy) const Text(packReadyLabel),
        Wrap(
          spacing: 8,
          alignment: WrapAlignment.center,
          children: [
            FilledButton.tonal(
              onPressed: busy ? null : onDownload,
              child: const Text(downloadMapLabel),
            ),
            if (hasPack)
              TextButton(
                onPressed: busy ? null : onDelete,
                child: const Text(deleteCacheLabel),
              ),
          ],
        ),
      ],
    );
  }
}
