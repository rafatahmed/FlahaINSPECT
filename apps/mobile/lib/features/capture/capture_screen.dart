import 'dart:typed_data';

import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/capture_draft.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:flaha_inspect/data/capture_repository.dart';
import 'package:flaha_inspect/features/capture/pin_adjust_screen.dart';
import 'package:flutter/material.dart';

class CaptureScreen extends StatefulWidget {
  const CaptureScreen({
    super.key,
    required this.projectId,
    required this.projectName,
    required this.archived,
    required this.capture,
    required this.location,
    required this.photos,
    required this.disk,
    this.seedFix,
    this.seedFreeBytes,
  });

  final String projectId;
  final String projectName;
  final bool archived;
  final CaptureGateway capture;
  final LocationSource location;
  final PhotoSource photos;
  final DiskSpace disk;
  final GeoFix? seedFix;
  final int? seedFreeBytes;

  @override
  State<CaptureScreen> createState() => _CaptureScreenState();
}

class _CaptureScreenState extends State<CaptureScreen> {
  late CaptureDraft _draft;
  var _busy = false;
  String? _error;
  StorageVerdict _storage = StorageVerdict.ok;
  final _note = TextEditingController();

  @override
  void initState() {
    super.initState();
    _draft = CaptureDraft(
      projectId: widget.projectId,
      projectArchived: widget.archived,
      fix: widget.seedFix,
    );
    _storage = storageVerdict(widget.seedFreeBytes);
    _boot();
  }

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _boot() async {
    final free = await widget.disk.freeBytes();
    final fix = await widget.location.acquire();
    if (!mounted) return;
    setState(() {
      _storage = storageVerdict(free);
      _draft = _draft.copyWith(fix: fix);
    });
  }

  Future<void> _takePhoto() async {
    final bytes = await widget.photos.capture();
    if (!mounted || bytes == null) return;
    setState(() => _draft = _draft.copyWith(originalBytes: bytes));
  }

  Future<void> _adjustPin() async {
    final current = _draft.fix;
    if (current == null) return;
    final next = await Navigator.of(context).push<GeoFix>(
      MaterialPageRoute(builder: (_) => PinAdjustScreen(fix: current)),
    );
    if (!mounted || next == null) return;
    setState(() => _draft = _draft.copyWith(fix: next, locationAdjusted: true));
  }

  Future<void> _save() async {
    if (_busy || _storage == StorageVerdict.block) return;
    final draft = _draft.copyWith(note: _note.text.trim().isEmpty ? null : _note.text.trim());
    if (!draft.canSave) {
      setState(() => _error = draft.blockReason);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.capture.save(draft);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(savedLocallyToast)));
      Navigator.of(context).pop(true);
    } catch (err) {
      if (!mounted) return;
      setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fix = _draft.fix;
    final gpsLabel = fix == null
        ? 'GPS —'
        : 'GPS ${fix.accuracyM == null ? '—' : '${fix.accuracyM!.toStringAsFixed(1)} m'}';
    final blocked = _storage == StorageVerdict.block || widget.archived;

    return Scaffold(
      appBar: AppBar(title: const Text(captureTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SizedBox(
            height: 180,
            child: Material(
              color: Colors.black12,
              child: InkWell(
                onTap: blocked ? null : _takePhoto,
                child: _draft.originalBytes == null
                    ? const Center(child: Text('Tap to capture photo'))
                    : Image.memory(_draft.originalBytes as Uint8List, fit: BoxFit.cover),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(gpsLabel),
          if (gpsNeedsSoftWarn(fix?.accuracyM))
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(gpsImpreciseBanner),
            ),
          TextButton(
            onPressed: fix == null || blocked ? null : _adjustPin,
            child: const Text(adjustPinLabel),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: categoryLabels.entries
                .map(
                  (e) => ChoiceChip(
                    label: Text(e.value),
                    selected: _draft.category == e.key,
                    onSelected: blocked
                        ? null
                        : (_) => setState(() => _draft = _draft.copyWith(category: e.key)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _note,
            enabled: !blocked,
            maxLength: noteMaxLength,
            maxLines: 3,
            decoration: const InputDecoration(labelText: notesLabel),
          ),
          if (_storage == StorageVerdict.warn) const Text(storageWarnCopy),
          if (_storage == StorageVerdict.block) const Text(storageBlockCopy),
          if (widget.archived) const Text(archivedNoCapture),
          if (_error != null) Text(_error!),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _busy || blocked ? null : _save,
            child: Text(_busy ? '…' : saveLocallyLabel),
          ),
        ],
      ),
    );
  }
}
