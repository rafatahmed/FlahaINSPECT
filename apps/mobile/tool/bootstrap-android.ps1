# Android SDK + one AVD for FlahaINSPECT inspect on this machine.
# Requires: Flutter pin (run bootstrap-flutter.ps1 first), Java 17, Developer Mode
# for Windows plugin builds. Does not install Android Studio (optional IDE).
$ErrorActionPreference = 'Stop'

$sdk = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT }
elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME }
else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }

$avdName = if ($env:FLAHA_AVD_NAME) { $env:FLAHA_AVD_NAME } else { 'flaha_inspect_api35' }
$api = '35'
$image = "system-images;android-$api;google_apis;x86_64"
$packages = @(
  'platform-tools',
  'emulator',
  "platforms;android-$api",
  'build-tools;35.0.0',
  'cmdline-tools;latest',
  $image
)

New-Item -ItemType Directory -Force -Path $sdk | Out-Null

function Find-SdkManager([string]$root) {
  $hits = @(
    (Join-Path $root 'cmdline-tools\latest\bin\sdkmanager.bat'),
    (Join-Path $root 'cmdline-tools\bin\sdkmanager.bat')
  ) + @(Get-ChildItem -Path (Join-Path $root 'cmdline-tools') -Recurse -Filter sdkmanager.bat -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
  foreach ($h in $hits) { if ($h -and (Test-Path $h)) { return $h } }
  return $null
}

$sdkmanager = Find-SdkManager $sdk
if (-not $sdkmanager) {
  $zipUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'
  $tmp = Join-Path $env:TEMP 'flaha-android-cmdline-tools.zip'
  $extract = Join-Path $env:TEMP 'flaha-android-cmdline-tools'
  Write-Host "Downloading Android command-line tools..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $tmp
  if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
  Expand-Archive -Path $tmp -DestinationPath $extract -Force
  $dest = Join-Path $sdk 'cmdline-tools\latest'
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  $inner = Join-Path $extract 'cmdline-tools'
  if (Test-Path $inner) { Move-Item $inner $dest } else { Move-Item $extract $dest }
  $sdkmanager = Find-SdkManager $sdk
}
if (-not $sdkmanager) { throw "sdkmanager not found under $sdk" }

Write-Host "SDK root: $sdk"
$env:ANDROID_SDK_ROOT = $sdk
$env:ANDROID_HOME = $sdk

# Pre-accept SDK licenses (sdkmanager.bat does not consume piped y on Windows).
$licenseDir = Join-Path $sdk 'licenses'
New-Item -ItemType Directory -Force -Path $licenseDir | Out-Null
$licenseHashes = @{
  'android-sdk-license'            = '24333f8a63b6825ea9c5514f83c2829b004d1fee'
  'android-sdk-preview-license'    = '84831b9409646167bb1c1f042f5deccf4ab25077'
  'google-gdk-license'             = '33b6a2b64607f11b759f320ef9dff4ae5c47d97a'
  'android-googletv-license'       = '601085b94cd77f0b54ff86406957099ebe79c4d6'
  'intel-android-extra-license'    = 'd975f751698a77b662f1254ddbeed3901e976f5a'
  'mips-android-sysimage-license'  = 'e9acab5b5f4422677c967dfdae78705118646bdf'
}
foreach ($name in $licenseHashes.Keys) {
  Set-Content -Path (Join-Path $licenseDir $name) -Value $licenseHashes[$name] -Encoding ascii
}
Write-Host "Accepted Android SDK licenses under $licenseDir"

$pkgList = ($packages -join ' ')
$install = "call `"$sdkmanager`" --sdk_root=$sdk --install $pkgList"
cmd /c $install
if ($LASTEXITCODE -ne 0) { throw "sdkmanager install failed ($LASTEXITCODE)" }

# Flutter 3.47 will otherwise auto-install API 36 + NDK (~2 GiB). Keep one platform.
$extras = @(
  'platforms;android-34',
  'platforms;android-36',
  'build-tools;36.0.0',
  'ndk;28.2.13676358',
  'cmake;3.22.1'
)
$un = "call `"$sdkmanager`" --sdk_root=$sdk --uninstall " + ($extras -join ' ')
cmd /c $un

$avdmanager = Join-Path (Split-Path $sdkmanager) 'avdmanager.bat'
$cFree = (Get-PSDrive C).Free
# C: is often too tight for the default 6 GiB userdata image; prefer D: when present.
if (-not $env:ANDROID_AVD_HOME) {
  $d = Get-PSDrive D -ErrorAction SilentlyContinue
  if ($d -and $d.Free -gt 8GB -and $cFree -lt 10GB) {
    $env:ANDROID_AVD_HOME = 'D:\Android\avd'
  }
}
$avdHome = if ($env:ANDROID_AVD_HOME) { $env:ANDROID_AVD_HOME } else { Join-Path $env:USERPROFILE '.android\avd' }
New-Item -ItemType Directory -Force -Path $avdHome | Out-Null
$avdIni = Join-Path $avdHome "$avdName.ini"
Write-Host "Creating AVD $avdName in $avdHome (2G userdata)"
cmd /c "echo no| `"$avdmanager`" create avd -n $avdName -k $image -d pixel_7 --force"
$cfg = Join-Path $avdHome "$avdName.avd\config.ini"
if (Test-Path $cfg) {
  $text = Get-Content $cfg -Raw
  $text = $text -replace 'disk.dataPartition.size\s*=\s*.+', 'disk.dataPartition.size = 2G'
  $text = $text -replace 'sdcard.size\s*=\s*.+', 'sdcard.size = 128 MB'
  $text = $text -replace 'hw.ramSize\s*=\s*.+', 'hw.ramSize = 1024'
  $text = $text -replace 'hw.cpu.ncore\s*=\s*.+', 'hw.cpu.ncore = 2'
  $text = $text -replace 'hw.lcd.height\s*=\s*.+', 'hw.lcd.height = 1280'
  $text = $text -replace 'hw.lcd.width\s*=\s*.+', 'hw.lcd.width = 720'
  $text = $text -replace 'hw.lcd.density\s*=\s*.+', 'hw.lcd.density = 320'
  Set-Content -Path $cfg -Value $text -NoNewline
}
if (-not (Test-Path $avdIni)) {
  throw "AVD $avdName was not created"
}

$flutter = Join-Path $env:LOCALAPPDATA 'flutter\bin\flutter.bat'
if (Test-Path $flutter) {
  & $flutter config --android-sdk $sdk
}

Write-Host "Android inspect SDK ready."
Write-Host "  ANDROID_SDK_ROOT=$sdk"
Write-Host "  AVD=$avdName"
Write-Host "Start emulator: emulator -avd $avdName"
Write-Host "Then from repo root: make mobile-run-android"
