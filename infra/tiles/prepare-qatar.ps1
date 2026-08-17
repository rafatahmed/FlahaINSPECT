# Build infra/tiles/data/qatar.mbtiles from Geofabrik (ODbL). Not public OSM tiles.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$data = Join-Path $here 'data'
New-Item -ItemType Directory -Force -Path $data | Out-Null
$pbf = Join-Path $data 'qatar-latest.osm.pbf'
$out = Join-Path $data 'qatar.mbtiles'
$pbfUrl = 'https://download.geofabrik.de/asia/qatar-latest.osm.pbf'

if (-not (Test-Path $pbf)) {
  Write-Host "Downloading $pbfUrl"
  Invoke-WebRequest -Uri $pbfUrl -OutFile $pbf
}

if (Test-Path $out) {
  Write-Host "Already have $out"
  exit 0
}

Write-Host 'Planetiler -> qatar.mbtiles (needs Docker)'
docker run --rm -v "${data}:/data" ghcr.io/onthegomap/planetiler:0.8.4 `
  --osm-path=/data/qatar-latest.osm.pbf `
  --output=/data/qatar.mbtiles `
  --download_osm_planet=false

if (-not (Test-Path $out)) {
  throw 'planetiler did not write qatar.mbtiles'
}
Write-Host "ok $out"
