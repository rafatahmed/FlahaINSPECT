# FlahaINSPECT mobile (`com.flaha.inspect`)

This is a **Flutter sibling app**. It is **not** a pnpm workspace package and **not** part of Turborepo.

Do not add `apps/mobile` to `pnpm-workspace.yaml`.

## Tooling

- Flutter stable (3.24+), Dart SDK matching `pubspec.yaml`
- Android Studio / Xcode only when you need device builds

Platform folders (`android/`, `ios/`, …) are generated locally when you first need a device:

```bash
cd apps/mobile
flutter create --org com.flaha --project-name flaha_inspect --platforms=android,ios .
```

That command must keep the existing `lib/` and `test/` sources. The application id is **`com.flaha.inspect`**.

## Commands

```bash
# from repo root
make mobile-get
make mobile-analyze
make mobile-test
make mobile-run

# or
cd apps/mobile
flutter pub get
flutter analyze
flutter test
flutter run
```

CI runs analyze + test via `.github/workflows/ci.yml` (`subosito/flutter-action`). It does **not** go through `turbo`.

## What is not here yet

Drift, secure storage, login, capture, TUS, maps — PR-10 onward. This PR is the empty shell so CI and layout exist on day one.
