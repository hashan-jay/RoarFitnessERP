# Stop running API instances, then build (avoids MSB3027 file lock errors).
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-api.ps1"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Building RoarFitnessERP.Api...'
dotnet build
exit $LASTEXITCODE
