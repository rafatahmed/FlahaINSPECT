# One-time Flutter install for this machine. Pin lives in apps/mobile/.flutter-version.
# Usage (repo root or apps/mobile): pwsh -File apps/mobile/tool/bootstrap-flutter.ps1
$ErrorActionPreference = 'Stop'

$mobileDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$pinFile = Join-Path $mobileDir '.flutter-version'
if (-not (Test-Path $pinFile)) {
  throw "Missing $pinFile — add the exact Flutter version (e.g. 3.32.8)."
}
$pin = (Get-Content $pinFile -Raw).Trim()
if (-not $pin) { throw '.flutter-version is empty' }

$root = if ($env:FLAHA_FLUTTER_HOME) { $env:FLAHA_FLUTTER_HOME } else { Join-Path $env:LOCALAPPDATA 'flutter' }
$bat = Join-Path $root 'bin\flutter.bat'

function CurrentVersion([string]$flutterBat) {
  $out = & $flutterBat --version 2>&1 | Out-String
  if ($out -match 'Flutter\s+(\d+\.\d+\.\d+)') { return $Matches[1] }
  return ''
}

if (-not (Test-Path $bat)) {
  Write-Host "Cloning Flutter $pin into $root"
  git clone --branch $pin --depth 1 https://github.com/flutter/flutter.git $root
} else {
  $have = CurrentVersion $bat
  if ($have -ne $pin) {
    Write-Host "Existing Flutter $have at $root — checking out $pin"
    git -C $root fetch --depth 1 origin tag $pin
    git -C $root checkout --detach $pin
  }
}

& $bat config --no-analytics | Out-Null
& $bat --version
Write-Host "Add to PATH for this user: $(Join-Path $root 'bin')"
$bin = Join-Path $root 'bin'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$bin*") {
  [Environment]::SetEnvironmentVariable('Path', "$bin;$userPath", 'User')
  $env:Path = "$bin;$env:Path"
  Write-Host "Prepended $bin to the user PATH."
}
