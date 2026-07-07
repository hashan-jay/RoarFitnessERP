# Start the API with dotnet watch (auto-rebuild). Stop first to avoid MSB3027 locks.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-api.ps1"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Starting API with dotnet watch on http://localhost:5188 ...'
Write-Host 'Hot reload is disabled — file saves trigger a full restart (no y/n prompts).'
Write-Host 'For the most stable dev loop, prefer: .\run-api.ps1'

$env:DOTNET_WATCH_RESTART_ON_RUDE_EDIT = '1'
dotnet watch run --launch-profile http --non-interactive --no-hot-reload
