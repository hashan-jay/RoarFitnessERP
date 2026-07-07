# Stop any running Roar Fitness API instances (fixes MSB3027 file lock and port conflicts)
$apiProcesses = Get-Process -Name "RoarFitnessERP.Api" -ErrorAction SilentlyContinue
if ($apiProcesses) {
    foreach ($process in $apiProcesses) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Stopped $($apiProcesses.Count) RoarFitnessERP.Api process(es)."
}

# Release port 5188 if another process is holding it
$portOwners = Get-NetTCPConnection -LocalPort 5188 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $portOwners) {
    if (-not $processId -or $processId -eq 0) { continue }
    $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if (-not $proc) { continue }
    if ($proc.ProcessName -eq "RoarFitnessERP.Api") {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped RoarFitnessERP.Api on port 5188 (PID $processId)."
    } elseif ($proc.ProcessName -in @("dotnet", "dotnet.exe")) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped dotnet process holding port 5188 (PID $processId)."
    } else {
        Write-Host "Port 5188 is used by $($proc.ProcessName) (PID $processId). Stop it manually if needed."
    }
}

Start-Sleep -Milliseconds 500
Write-Host "You can now run: .\run-api.ps1"
