# Stop Roar Fitness API instances (fixes MSB3027 / CS2012 file locks).
Set-StrictMode -Version Latest

$ApiPort = 5188
$ProjectMarker = 'RoarFitnessERP.Api'
$ProjectRoot = $PSScriptRoot
$stoppedIds = [System.Collections.Generic.HashSet[int]]::new()

function Get-ProcessCommandLine {
    param([int]$ProcessId)

    if ($ProcessId -le 0) { return $null }

    try {
        return (Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId").CommandLine
    } catch {
        return $null
    }
}

function Test-IsRoarApiRelatedProcess {
    param([System.Diagnostics.Process]$Process)

    if ($Process.ProcessName -eq 'RoarFitnessERP.Api') {
        return $true
    }

    if ($Process.ProcessName -ne 'dotnet') {
        return $false
    }

    $commandLine = Get-ProcessCommandLine -ProcessId $Process.Id
    if ([string]::IsNullOrWhiteSpace($commandLine)) {
        return $false
    }

    if ($commandLine -match 'dotnet\s+(build|restore|publish|test|tool|nuget)\b') {
        return $false
    }

    return $commandLine -match [regex]::Escape($ProjectMarker)
}

function Stop-TrackedProcess {
    param([System.Diagnostics.Process]$Process)

    if ($stoppedIds.Contains($Process.Id)) {
        return 0
    }

    $label = $Process.ProcessName
    $commandLine = Get-ProcessCommandLine -ProcessId $Process.Id
    if ($commandLine) {
        $label = "$label :: $($commandLine.Substring(0, [Math]::Min(120, $commandLine.Length)))"
    }

    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
    [void]$stoppedIds.Add($Process.Id)
    Write-Host "Stopped $label (PID $($Process.Id))."
    return 1
}

function Stop-RoarApiProcesses {
    $count = 0

    $null = Start-Process -FilePath 'taskkill.exe' -ArgumentList '/F', '/IM', 'RoarFitnessERP.Api.exe', '/T' -NoNewWindow -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue -RedirectStandardOutput "$env:TEMP\roar-stop-api.out" -RedirectStandardError "$env:TEMP\roar-stop-api.err"

    foreach ($process in Get-Process -Name 'RoarFitnessERP.Api' -ErrorAction SilentlyContinue) {
        $count += Stop-TrackedProcess -Process $process
    }

    foreach ($process in Get-Process -Name 'dotnet' -ErrorAction SilentlyContinue) {
        if (Test-IsRoarApiRelatedProcess -Process $process) {
            $count += Stop-TrackedProcess -Process $process
        }
    }

    $portOwners = Get-NetTCPConnection -LocalPort $ApiPort -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $portOwners) {
        if (-not $processId -or $processId -eq 0) { continue }

        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if (-not $process) { continue }

        if ($process.ProcessName -in @('dotnet', 'RoarFitnessERP.Api')) {
            $count += Stop-TrackedProcess -Process $process
        } else {
            Write-Host "Port $ApiPort is held by $($process.ProcessName) (PID $processId). Left running."
        }
    }

    return $count
}

function Test-ApiOutputLocked {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return $false
    }

    try {
        $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
        $stream.Close()
        return $false
    } catch {
        return $true
    }
}

$stopped = 0
for ($attempt = 1; $attempt -le 3; $attempt++) {
    $stopped += Stop-RoarApiProcesses
    if ($attempt -lt 3) {
        Start-Sleep -Milliseconds 700
    }
}

Start-Sleep -Milliseconds 500

$exePath = Join-Path $ProjectRoot 'bin\Debug\net10.0\RoarFitnessERP.Api.exe'
$dllPath = Join-Path $ProjectRoot 'bin\Debug\net10.0\RoarFitnessERP.Api.dll'
$stillLocked = (Test-ApiOutputLocked -Path $exePath) -or (Test-ApiOutputLocked -Path $dllPath)

if ($stillLocked) {
    Write-Host 'Output files still locked — running one more cleanup pass...'
    $stopped += Stop-RoarApiProcesses
    Start-Sleep -Milliseconds 800
    $stillLocked = (Test-ApiOutputLocked -Path $exePath) -or (Test-ApiOutputLocked -Path $dllPath)
}

if ($stopped -eq 0) {
    Write-Host 'No RoarFitnessERP.Api process was running.'
} else {
    Write-Host "Stopped $stopped API-related process(es)."
}

if ($stillLocked) {
    Write-Host 'WARNING: RoarFitnessERP.Api build output is still locked.'
    Write-Host 'Close any terminal running dotnet watch/run, then run .\stop-api.ps1 again.'
    exit 1
}

Write-Host "Port $ApiPort should be free. You can now run: .\run-api.ps1 or .\build-api.ps1"
exit 0
