param(
  [string]$Port = "49157",
  [switch]$Build
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$clientEnv = Join-Path $repoRoot "client\.env"

if (-not (Test-Path $clientEnv)) {
  throw "Missing client\.env. Docker builds need it for public frontend values such as MAPTILER_API_KEY."
}

$env:FIRESCOPE_CLIENT_PORT = $Port

$args = @(
  "--env-file", $clientEnv,
  "up",
  "-d"
)

if ($Build) {
  $args += "--build"
}

$args += "client"

Push-Location $repoRoot
try {
  docker compose @args
} finally {
  Pop-Location
}
