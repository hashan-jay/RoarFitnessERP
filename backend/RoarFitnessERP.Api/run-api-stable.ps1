# Start the API without dotnet watch (most stable — use when watch keeps exiting)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-api.ps1"
Write-Host 'Building...'
dotnet build
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Starting API on http://localhost:5188 (Scalar: http://localhost:5188/scalar/v1) ...'
dotnet run --launch-profile http --no-build
