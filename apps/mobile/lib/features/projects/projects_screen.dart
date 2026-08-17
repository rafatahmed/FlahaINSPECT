import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/data/map_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/features/map/map_screen.dart';
import 'package:flaha_inspect/features/projects/project_home.dart';
import 'package:flaha_inspect/map/tile_policy.dart';
import 'package:flutter/material.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({
    super.key,
    required this.projects,
    required this.online,
    required this.onLogout,
    this.gpsLabel = 'GPS —',
    this.capture,
    this.maps,
    this.tiles,
  });

  final ProjectCatalog projects;
  final bool online;
  final VoidCallback onLogout;
  final String gpsLabel;
  final CaptureBindings? capture;
  final MapRepository? maps;
  final TilePolicy? tiles;

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  late Future<List<ProjectListItem>> _future;
  Object? _pullError;

  @override
  void initState() {
    super.initState();
    _future = _load(pull: true);
  }

  Future<List<ProjectListItem>> _load({required bool pull}) async {
    if (pull) {
      try {
        await widget.projects.pullAll();
        _pullError = null;
      } catch (err) {
        _pullError = err;
      }
    }
    return widget.projects.listLocal();
  }

  void _reload() {
    setState(() {
      _future = _load(pull: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(productName),
        actions: [
          PopupMenuButton<String>(
            tooltip: 'Menu',
            onSelected: (value) {
              if (value == 'logout') widget.onLogout();
            },
            itemBuilder: (ctx) => const [
              PopupMenuItem(value: 'logout', child: Text('Log out')),
            ],
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              '${widget.online ? 'Online' : 'Offline'} · ${widget.gpsLabel}',
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Assigned projects'),
          ),
          Expanded(
            child: FutureBuilder<List<ProjectListItem>>(
              future: _future,
              builder: (context, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final items = snap.data ?? const <ProjectListItem>[];
                if (items.isEmpty) {
                  return Center(
                    child: Text(
                      _pullError != null ? genericLoginFailure : noAssignedProjects,
                      textAlign: TextAlign.center,
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => _reload(),
                  child: ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (context, i) => _ProjectTile(
                      item: items[i],
                      capture: widget.capture,
                      maps: widget.maps,
                      tiles: widget.tiles,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ProjectTile extends StatelessWidget {
  const _ProjectTile({required this.item, this.capture, this.maps, this.tiles});
  final ProjectListItem item;
  final CaptureBindings? capture;
  final MapRepository? maps;
  final TilePolicy? tiles;

  @override
  Widget build(BuildContext context) {
    final subtitle = item.isArchived
        ? '(read only)'
        : '${item.pointCount} points · ${item.pendingCount} pending';
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(item.isArchived ? '${item.name}  ARCHIVED' : item.name),
        subtitle: Text(subtitle),
        trailing: TextButton(
                onPressed: () {
                  final page = (capture != null && maps != null && tiles != null)
                      ? MapScreen(
                          projectId: item.id,
                          bindings: capture!,
                          maps: maps!,
                          tiles: tiles!,
                        )
                      : capture == null
                          ? Scaffold(
                              appBar: AppBar(title: Text(item.name)),
                              body: const Center(child: Text('Map — PR-13')),
                            )
                          : ProjectHomeScreen(project: item, bindings: capture!);
                  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));
                },
                child: Text(item.isArchived ? 'View' : 'Open'),
              ),
      ),
    );
  }
}
