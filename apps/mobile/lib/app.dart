import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flaha_inspect/data/project_repository.dart';
import 'package:flaha_inspect/features/login/login_screen.dart';
import 'package:flaha_inspect/features/projects/projects_screen.dart';
import 'package:flutter/material.dart';

class FlahaInspectApp extends StatefulWidget {
  const FlahaInspectApp({
    super.key,
    required this.auth,
    required this.projects,
    this.online = true,
  });

  final AuthGateway auth;
  final ProjectCatalog projects;
  final bool online;

  @override
  State<FlahaInspectApp> createState() => _FlahaInspectAppState();
}

class _FlahaInspectAppState extends State<FlahaInspectApp> {
  var _booting = true;
  var _loggedIn = false;
  var _updateRequired = false;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    try {
      final ok = await widget.auth.restore();
      if (!mounted) return;
      setState(() {
        _loggedIn = ok;
        _booting = false;
      });
    } on UpdateRequiredException {
      if (!mounted) return;
      setState(() {
        _updateRequired = true;
        _booting = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loggedIn = false;
        _booting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: productName,
      home: _home(),
    );
  }

  Widget _home() {
    if (_booting) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_updateRequired) {
      return const Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(minAppVersionTitle, style: TextStyle(fontSize: 20)),
                SizedBox(height: 12),
                Text(minAppVersionBody, textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      );
    }
    if (!_loggedIn) {
      return LoginScreen(
        auth: widget.auth,
        onLoggedIn: () => setState(() => _loggedIn = true),
      );
    }
    return ProjectsScreen(
      projects: widget.projects,
      online: widget.online,
      onLogout: () async {
        await widget.auth.logout();
        if (!mounted) return;
        setState(() => _loggedIn = false);
      },
    );
  }
}
