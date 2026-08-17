import 'dart:io';

import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:flaha_inspect/data/map_repository.dart';
import 'package:flaha_inspect/features/capture/capture_screen.dart';
import 'package:flaha_inspect/features/projects/project_home.dart';
import 'package:flaha_inspect/features/sync/sync_screen.dart';
import 'package:flaha_inspect/features/map/offline_pack_bar.dart';
import 'package:flaha_inspect/map/category_style.dart';
import 'package:flaha_inspect/map/geojson.dart';
import 'package:flaha_inspect/map/map_copy.dart';
import 'package:flaha_inspect/map/offline_pack.dart';
import 'package:flaha_inspect/map/pack_tile_provider.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({
    super.key,
    required this.projectId,
    required this.bindings,
    required this.maps,
    required this.tiles,
    this.packs,
  });

  final String projectId;
  final CaptureBindings bindings;
  final MapRepository maps;
  final TilePolicy tiles;
  final OfflinePacks? packs;

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String _filter = 'all';
  List<MapMarker> _markers = const [];
  MapProject? _project;
  GeoFix? _me;
  var _storage = StorageVerdict.ok;
  var _hasPack = false;
  var _packBusy = false;
  PackProgress? _packProgress;
  String? _packRoot;
  String? _packError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final project = await widget.maps.project(widget.projectId);
    final markers = await widget.maps.markers(widget.projectId);
    final me = await widget.bindings.location.acquire();
    final free = await widget.bindings.disk.freeBytes();
    final has = widget.packs == null ? false : await widget.packs!.hasPack(widget.projectId);
    final root = widget.packs == null ? null : await widget.packs!.packRoot(widget.projectId);
    if (!mounted) return;
    setState(() {
      _project = project;
      _markers = markers;
      _me = me;
      _storage = storageVerdict(free);
      _hasPack = has;
      _packRoot = root;
    });
  }

  Future<void> _downloadPack() async {
    final packs = widget.packs;
    if (packs == null || _packBusy) return;
    if (_storage == StorageVerdict.block) return;
    final ring = polygonRing(_project?.boundaryGeojson);
    final area = ring.isNotEmpty
        ? [for (final p in ring) (latitude: p.latitude, longitude: p.longitude)]
        : [for (final m in _markers) (latitude: m.latitude, longitude: m.longitude)];
    if (area.isEmpty && _me != null) {
      area.add((latitude: _me!.latitude, longitude: _me!.longitude));
    }
    if (area.isEmpty) {
      setState(() => _packError = noAreaToDownload);
      return;
    }
    setState(() {
      _packBusy = true;
      _packError = null;
    });
    final ok = await packs.download(
      projectId: widget.projectId,
      tiles: widget.tiles,
      area: area,
      onProgress: (p) {
        if (mounted) setState(() => _packProgress = p);
      },
    );
    final root = await packs.packRoot(widget.projectId);
    if (!mounted) return;
    setState(() {
      _packBusy = false;
      _hasPack = ok;
      _packRoot = root;
      if (!ok) _packError = noAreaToDownload;
    });
  }

  Future<void> _deletePack() async {
    final packs = widget.packs;
    if (packs == null || _packBusy) return;
    await packs.delete(widget.projectId);
    if (!mounted) return;
    setState(() {
      _hasPack = false;
      _packRoot = null;
      _packProgress = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final visible = _markers.where((m) => _filter == 'all' || m.category == _filter).toList();
    final ring = polygonRing(_project?.boundaryGeojson);
    final center = _me != null
        ? LatLng(_me!.latitude, _me!.longitude)
        : visible.isNotEmpty
            ? LatLng(visible.first.latitude, visible.first.longitude)
            : const LatLng(25.286, 51.534);
    final archived = _project?.isArchived ?? false;
    final captureBlocked = archived || _storage == StorageVerdict.block;

    return Scaffold(
      appBar: AppBar(
        title: Text(_project?.name ?? 'Map'),
        actions: [
          if (widget.bindings.sync != null)
            TextButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => SyncScreen(
                      projectId: widget.projectId,
                      projectName: _project?.name ?? '',
                      worker: widget.bindings.sync!,
                    ),
                  ),
                );
              },
              child: const Text('Sync', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  options: MapOptions(initialCenter: center, initialZoom: 14),
                  children: [
                    if (widget.tiles.tilesAvailable || _hasPack)
                      TileLayer(
                        urlTemplate: widget.tiles.urlTemplate,
                        userAgentPackageName: widget.tiles.userAgent,
                        tileProvider: PackAwareTileProvider(packRoot: _packRoot),
                      )
                    else
                      const ColoredBox(color: Color(0xFFCFD8DC)),
                    if (ring.length >= 3)
                      PolygonLayer(
                        polygons: [
                          Polygon(
                            points: [for (final p in ring) LatLng(p.latitude, p.longitude)],
                            color: const Color(0x332196F3),
                            borderColor: const Color(0xFF1565C0),
                            borderStrokeWidth: 2,
                          ),
                        ],
                      ),
                    if (_me != null && _me!.accuracyM != null)
                      CircleLayer(
                        circles: [
                          CircleMarker(
                            point: LatLng(_me!.latitude, _me!.longitude),
                            radius: _me!.accuracyM!,
                            useRadiusInMeter: true,
                            color: const Color(0x332196F3),
                            borderStrokeWidth: 1,
                            borderColor: const Color(0xFF1565C0),
                          ),
                        ],
                      ),
                    MarkerLayer(
                      markers: [
                        for (final m in visible)
                          Marker(
                            point: LatLng(m.latitude, m.longitude),
                            width: 22,
                            height: 22,
                            child: GestureDetector(
                              onTap: () => _sheet(m),
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  color: colorForCategory(m.category),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                              ),
                            ),
                          ),
                        if (_me != null)
                          Marker(
                            point: LatLng(_me!.latitude, _me!.longitude),
                            width: 16,
                            height: 16,
                            child: const DecoratedBox(
                              decoration: BoxDecoration(color: Colors.blue, shape: BoxShape.circle),
                            ),
                          ),
                      ],
                    ),
                    SimpleAttributionWidget(source: Text(widget.tiles.attribution)),
                  ],
                ),
                if (!widget.tiles.tilesAvailable && !_hasPack)
                  const Align(
                    alignment: Alignment.center,
                    child: Text(tilesUnavailable),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                Text(_me?.accuracyM == null ? 'Accuracy —' : 'Accuracy ${_me!.accuracyM!.toStringAsFixed(1)} m'),
                Wrap(
                  spacing: 8,
                  children: [
                    for (final id in ['all', 'defect', 'normal', 'note'])
                      ChoiceChip(
                        label: Text(id == 'all' ? 'All' : mapCategoryLabels[id]!),
                        selected: _filter == id,
                        onSelected: (_) => setState(() => _filter = id),
                      ),
                  ],
                ),
                if (widget.packs != null)
                  OfflinePackBar(
                    tiles: widget.tiles,
                    hasPack: _hasPack,
                    busy: _packBusy,
                    progress: _packProgress,
                    onDownload: () {
                      _downloadPack();
                    },
                    onDelete: () {
                      _deletePack();
                    },
                  ),
                if (_packError != null) Text(_packError!, textAlign: TextAlign.center),
                FilledButton(
                  onPressed: captureBlocked
                      ? null
                      : () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => CaptureScreen(
                                projectId: widget.projectId,
                                projectName: _project?.name ?? '',
                                archived: archived,
                                capture: widget.bindings.capture,
                                location: widget.bindings.location,
                                photos: widget.bindings.photos,
                                disk: widget.bindings.disk,
                              ),
                            ),
                          );
                        },
                  child: Text(archived ? archivedNoCapture : captureTitle),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _sheet(MapMarker m) {
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(mapCategoryLabels[m.category] ?? m.category, style: Theme.of(ctx).textTheme.titleMedium),
            Text(m.capturedAt),
            if (m.note != null) Text(m.note!),
            if (m.thumbPath != null && File(m.thumbPath!).existsSync())
              Image.file(File(m.thumbPath!), height: 120)
            else
              const Text('Photo still uploading'),
          ],
        ),
      ),
    );
  }
}
