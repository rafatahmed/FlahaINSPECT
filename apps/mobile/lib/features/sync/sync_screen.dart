import 'package:flaha_inspect/sync/outbox_worker.dart';
import 'package:flutter/material.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({
    super.key,
    required this.projectId,
    required this.projectName,
    required this.worker,
  });

  final String projectId;
  final String projectName;
  final OutboxWorker worker;

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  var _wifiOnly = false;
  var _busy = false;
  var _pending = 0;
  String? _lastSync;
  List<SyncItem> _items = const [];

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    final wifi = await widget.worker.wifiOnly();
    final pending = await widget.worker.pendingCount(widget.projectId);
    final last = await widget.worker.lastSyncAt();
    final items = await widget.worker.listForProject(widget.projectId);
    if (!mounted) return;
    setState(() {
      _wifiOnly = wifi;
      _pending = pending;
      _lastSync = last;
      _items = items;
    });
  }

  Future<void> _syncNow() async {
    setState(() => _busy = true);
    try {
      await widget.worker.tick(activeProjectId: widget.projectId);
    } finally {
      if (mounted) {
        setState(() => _busy = false);
        await _reload();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.projectName)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Pending: $_pending'),
                Text('Last sync: ${_lastSync ?? '—'}'),
                Row(
                  children: [
                    const Text('Wi-Fi only'),
                    Switch(
                      value: _wifiOnly,
                      onChanged: (v) async {
                        await widget.worker.setWifiOnly(v);
                        await _reload();
                      },
                    ),
                    const Spacer(),
                    FilledButton(
                      onPressed: _busy ? null : _syncNow,
                      child: Text(_busy ? '…' : 'Sync now'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, i) {
                final item = _items[i];
                final progress = item.progressPct == null ? '' : ' · photo ${item.progressPct!.round()}%';
                return ListTile(
                  title: Text('${item.category}  ${item.syncStatus}'),
                  subtitle: Text(
                    '${item.note ?? ''} ${item.accuracyM == null ? '' : '· ${item.accuracyM!.toStringAsFixed(1)} m'}$progress'
                        .trim(),
                  ),
                  trailing: item.syncStatus == 'failed' && item.retryable
                      ? TextButton(
                          onPressed: () async {
                            await widget.worker.retry(item.pointClientUuid);
                            await _reload();
                          },
                          child: const Text('Retry'),
                        )
                      : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
