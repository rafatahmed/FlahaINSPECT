import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:flaha_inspect/data/capture_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/features/capture/capture_screen.dart';
import 'package:flaha_inspect/features/sync/sync_screen.dart';
import 'package:flaha_inspect/sync/outbox_worker.dart';
import 'package:flutter/material.dart';

class CaptureBindings {
  const CaptureBindings({
    required this.capture,
    required this.location,
    required this.photos,
    required this.disk,
    this.sync,
  });

  final CaptureGateway capture;
  final LocationSource location;
  final PhotoSource photos;
  final DiskSpace disk;
  final OutboxWorker? sync;
}

class ProjectHomeScreen extends StatelessWidget {
  const ProjectHomeScreen({super.key, required this.project, required this.bindings});

  final ProjectListItem project;
  final CaptureBindings bindings;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(project.name)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Map — PR-13'),
            const SizedBox(height: 16),
            if (bindings.sync != null)
              FilledButton.tonal(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => SyncScreen(
                        projectId: project.id,
                        projectName: project.name,
                        worker: bindings.sync!,
                      ),
                    ),
                  );
                },
                child: const Text('Sync'),
              ),
            const SizedBox(height: 8),
            if (project.isArchived)
              const Text(archivedNoCapture)
            else
              FilledButton(
                onPressed: () {
                  Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                      builder: (_) => CaptureScreen(
                        projectId: project.id,
                        projectName: project.name,
                        archived: project.isArchived,
                        capture: bindings.capture,
                        location: bindings.location,
                        photos: bindings.photos,
                        disk: bindings.disk,
                      ),
                    ),
                  );
                },
                child: const Text(captureTitle),
              ),
          ],
        ),
      ),
    );
  }
}
