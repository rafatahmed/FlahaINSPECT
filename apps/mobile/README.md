# FlahaINSPECT mobile (`com.flaha.inspect`)

This is a **Flutter sibling app**. It is **not** a pnpm workspace package and **not** part of Turborepo.

Do not add `apps/mobile` to `pnpm-workspace.yaml`.

## Flutter + Drift (the one way)

1. Pin lives in [`.flutter-version`](./.flutter-version). CI and `make mobile-bootstrap` use that exact SDK.
2. Drift tables live in `lib/db/tables.dart`. The database is `lib/db/app_database.dart`.
3. **Commit** generated `lib/db/app_database.g.dart`. After any schema change:

```bash
make mobile-generate
# commit the updated *.g.dart
```

CI runs `build_runner` and **fails** if generated files are stale (`git diff --exit-code`).

Session JWTs are **never** Drift columns (KD-37). They go in `SecureSessionStore` (Keychain / Keystore).

### First time on a machine

```bash
# repo root
make mobile-bootstrap    # clones pinned Flutter to %LOCALAPPDATA%/flutter and prepends PATH
make mobile-get
make mobile-generate     # only needed after schema edits if .g.dart is missing
make mobile-analyze
make mobile-test
```

Or:

```powershell
pwsh -File apps/mobile/tool/bootstrap-flutter.ps1
```

Override install location with `FLAHA_FLUTTER_HOME`. Override the binary with `FLUTTER=/path/to/flutter`.

## Tooling

- Flutter version = `.flutter-version` (do not float `channel: stable` in CI).
- Android Studio / Xcode only when you need device builds.

Platform folders (`android/`, `ios/`, …) are generated locally when you first need a device:

```bash
cd apps/mobile
flutter create --org com.flaha --project-name flaha_inspect --platforms=android,ios .
```

That command must keep the existing `lib/` and `test/` sources. The application id is **`com.flaha.inspect`**.

## Commands

```bash
# from repo root
make mobile-bootstrap
make mobile-get
make mobile-generate
make mobile-analyze
make mobile-test
make mobile-run

# or
cd apps/mobile
flutter pub get
dart run build_runner build
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3001
```

CI: `.github/workflows/ci.yml` job `flutter sibling` — pin + pub get + generate + dirty check + analyze + test. Not turbo.

## Capture (PR-11)

Create-once: one photo + category required. GPS accuracy soft-warns above 10 m. Pin adjust is pre-save only. Save writes point + photo + `CreateInspectionPoint` + `UploadPhoto` in one Drift transaction. Upload candidate is 1920px JPEG 80 with GPS EXIF stripped (KD-8 / KD-36).

## API

`--dart-define=API_BASE_URL=http://127.0.0.1:3001` (Android emulator: `http://10.0.2.2:3001`).
