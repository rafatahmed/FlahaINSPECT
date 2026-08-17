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
- Android compile/target **API 35 only**. Do not set `ndkVersion` (Flutter 3.47’s default downloads ~2 GiB of NDK).
- Gradle heap is **1.5 GiB** (`android/gradle.properties`). Do not restore the Flutter template `8G`/`4G`.
- One AVD: `flaha_inspect_api35`. One system image. Extra `platforms;android-34|36` and `build-tools;36` are waste.
- Android Studio / Xcode only when you need device builds.

### Disk budget (do not let Flutter float)

A debug APK is ~80 MiB. A **lean** machine is not 50 GiB:

| Keep | Typical | Notes |
|------|--------:|-------|
| Flutter pin 3.47.0 | ~3 GiB | `%LOCALAPPDATA%/flutter` |
| Android SDK (35 only) | ~5 GiB | platform-tools, build-tools 35, `platforms;android-35`, emulator |
| One system image + AVD | ~4 GiB | Prefer `D:\Android\avd` when C: is tight |
| Gradle cache | grows | Set user env `GRADLE_USER_HOME=D:\Android\gradle` |

**Do not set** `ndkVersion = flutter.ndkVersion` (~2 GiB). **Do not** leave `compileSdk = flutter.compileSdkVersion` (36 on this pin — pulls another platform). **Do not** restore Gradle `-Xmx8G`. Inspect **web first, then mobile**; never both plus Gradle on a 6 GiB C: drive.

`make mobile-bootstrap-android` installs API 35 only and uninstalls 34/36 + NDK + CMake if Flutter sneaks them back.

`android/` and `windows/` are in tree (application id **`com.flaha.inspect`**). iOS is still generated when needed:

```bash
cd apps/mobile
flutter create --org com.flaha --project-name flaha_inspect --platforms=ios .
```

That command must keep the existing `lib/` and `test/` sources.

### Inspect on this machine (R2 door)

1. **Data plane** (repo root): `make up && make migrate-twice && make seed`  
   Seed users (password = `SEED_PASSWORD` in `.env`, never production):
   - manager: `manager@local.flaha`
   - inspector: `inspector@local.flaha`
2. **Web (manager):** `make web-dev` → http://127.0.0.1:3000
3. **Android toolchain (once):** `make mobile-bootstrap-android`  
   Accepts the Android SDK license automatically. If C: is tight, the AVD lands on `D:\Android\avd` (2G userdata).  
   Then: `emulator -avd flaha_inspect_api35 -no-metrics` and `make mobile-run-android`.  
   Emulator → host API is **`http://10.0.2.2:3001`**. A USB device uses the PC LAN IP instead.  
   A `cmdline-tools\latest-2` warning is harmless if `latest` already existed.
4. **Windows desktop (UI only):** `make mobile-run-windows` — login / projects / map. Camera + GPS need an Android device. Windows plugin builds need **Developer Mode**.
5. Do **not** bulk-download public OSM. Dev map is ambient tiles only until G-01.

`make mobile-run` still targets whatever `flutter devices` picks and uses `127.0.0.1` (desktop / Chrome).

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

CI: `.github/workflows/ci.yml` job `flutter sibling` clones the pin from `github.com/flutter/flutter` (no `subosito/flutter-action` — that download was 429ing on `push`). Then pub get + generate + dirty check + analyze + test. Not turbo.

## Capture (PR-11)

Create-once: one photo + category required. GPS accuracy is always shown and soft-warns above 10 m. Category buttons are large and high-contrast. Pin adjust is pre-save only. Save writes point + photo + `CreateInspectionPoint` + `UploadPhoto` in one Drift transaction. Upload candidate is 1920px JPEG 80 with GPS EXIF stripped (KD-8 / KD-36).

EN/AR keys live in `lib/l10n/app_*.arb`. The UI locale is locked to English (no login toggle). Arabic + RTL is a resource scaffold for R3 (G-09).

## API

`--dart-define=API_BASE_URL=http://127.0.0.1:3001` (Android emulator: `http://10.0.2.2:3001`).
