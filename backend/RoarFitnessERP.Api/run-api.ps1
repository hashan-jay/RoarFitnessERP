# Start the Roar Fitness API with a clean build (avoids hot-reload duplicate-type errors)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-api.ps1"
Write-Host 'Cleaning and building...'
dotnet clean --verbosity quiet
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Build failed. Fix errors above, then run .\run-api.cmd or .\run-api.ps1 again.'
    exit $LASTEXITCODE
}
Write-Host 'Starting API on http://localhost:5188 ...'
dotnet watch run --launch-profile http --non-interactive
