param(
    [string]$Url = 'http://localhost:5188/api/health',
    [int]$TimeoutSeconds = 120
)

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)

Write-Host "Waiting for API at $Url ..."

while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host 'API is ready.'
            exit 0
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

Write-Host "API did not respond within $TimeoutSeconds seconds."
Write-Host 'Run backend\RoarFitnessERP.Api\run-api.cmd in a separate terminal, then refresh the web app.'
exit 1
