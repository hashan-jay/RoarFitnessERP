# Start Roar Fitness frontend (Vite on port 5200).
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-frontend.ps1"
Write-Host 'Starting frontend on http://localhost:5200 ...'
npm run dev
