import 'package:flaha_inspect/api/inspect_api.dart';
import 'package:flaha_inspect/auth/login_copy.dart';
import 'package:flaha_inspect/brand/brand_mark.dart';
import 'package:flaha_inspect/data/auth_repository.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth, required this.onLoggedIn});

  final AuthGateway auth;
  final VoidCallback onLoggedIn;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  var _busy = false;
  String? _error;
  var _blocked = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy || _blocked) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.auth.login(_email.text, _password.text);
      if (!mounted) return;
      widget.onLoggedIn();
    } on UpdateRequiredException {
      if (!mounted) return;
      setState(() => _blocked = true);
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => const AlertDialog(
          title: Text(minAppVersionTitle),
          content: Text(minAppVersionBody),
        ),
      );
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = loginErrorMessage(code: err.code));
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = genericLoginFailure);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              const Center(child: BrandMark(variant: BrandVariant.color, height: 120)),
              const SizedBox(height: 32),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.username, AutofillHints.email],
                enabled: !_busy && !_blocked,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _password,
                obscureText: true,
                autofillHints: const [AutofillHints.password],
                enabled: !_busy && !_blocked,
                decoration: const InputDecoration(labelText: 'Password'),
                onSubmitted: (_) => _submit(),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _busy || _blocked ? null : _submit,
                child: Text(_busy ? '…' : loginButtonLabel),
              ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, textAlign: TextAlign.center),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
