# Stop only the running RoarFitnessERP.Api app (keeps dotnet watch supervisor alive).
Set-StrictMode -Version Latest

$ApiPort = 5188
$ProjectMarker = 'RoarFitnessERP.Api'

function Get-ProcessCommandLine {
    param([int]$ProcessId)

    if ($ProcessId -le 0) { return $null }

    try {
        return (Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId").CommandLine
    } catch {
        return $null
    }
}

function Test-IsDotNetWatchSupervisor {
    param([string]$CommandLine)

    return -not [string]::IsNullOrWhiteSpace($CommandLine) -and ($CommandLine -match 'dotnet\s+watch')
}

function Test-IsRoarApiAppProcess {
    param(
        [System.Diagnostics.Process]$Process,
        [string]$CommandLine
    )

    if ($Process.ProcessName -eq 'RoarFitnessERP.Api') {
        return $true
    }

    if ($Process.ProcessName -ne 'dotnet') {
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($CommandLine)) {
        return $false
    }

    if (Test-IsDotNetWatchSupervisor -CommandLine $CommandLine) {
        return $false
    }

    return $CommandLine -match [regex]::Escape($ProjectMarker)
}

$stopped = 0

$null = Start-Process -FilePath 'taskkill.exe' -ArgumentList '/F', '/IM', 'RoarFitnessERP.Api.exe', '/T' -NoNewWindow -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue -RedirectStandardOutput "$env:TEMP\roar-stop-app.out" -RedirectStandardError "$env:TEMP\roar-stop-app.err"

foreach ($process in Get-Process -Name 'RoarFitnessERP.Api' -ErrorAction SilentlyContinue) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    $stopped++
}

foreach ($process in Get-Process -Name 'dotnet' -ErrorAction SilentlyContinue) {
    $commandLine = Get-ProcessCommandLine -ProcessId $process.Id
    if (Test-IsRoarApiAppProcess -Process $process -CommandLine $commandLine) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $stopped++
    }
}

$portOwners = Get-NetTCPConnection -LocalPort $ApiPort -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $portOwners) {
    if (-not $processId -or $processId -eq 0) { continue }

    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if (-not $process) { continue }

    $commandLine = Get-ProcessCommandLine -ProcessId $process.Id
    if ($process.ProcessName -eq 'RoarFitnessERP.Api' -or (Test-IsRoarApiAppProcess -Process $process -CommandLine $commandLine)) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $stopped++
    }
}

if ($stopped -gt 0) {
    Start-Sleep -Milliseconds 400
}

exit 0
