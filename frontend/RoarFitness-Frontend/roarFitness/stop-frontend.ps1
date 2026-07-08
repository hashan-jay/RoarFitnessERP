# Stop Vite dev server on port 5200 (Roar Fitness frontend).
Set-StrictMode -Version Latest

$FrontendPort = 5200
$stopped = 0

$portOwners = Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $portOwners) {
    if (-not $processId -or $processId -eq 0) { continue }

    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if (-not $process) { continue }

    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped $($process.ProcessName) (PID $processId) on port $FrontendPort."
    $stopped++
}

if ($stopped -eq 0) {
    Write-Host "No process was listening on port $FrontendPort."
} else {
    Write-Host "Port $FrontendPort should be free."
}

exit 0
