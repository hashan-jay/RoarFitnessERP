@echo off
setlocal
echo Starting Roar Fitness ERP dev stack...
echo.
echo 1) API         -^> http://localhost:5188
echo 2) Web         -^> http://localhost:5200
echo 3) Fingerprint -^> http://localhost:5190
echo.
start "Roar API" cmd /k "cd /d %~dp0backend\RoarFitnessERP.Api && call run-api.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wait-for-api.ps1"
if errorlevel 1 (
    echo.
    echo Vite will still start, but /api requests fail until the API window is running.
    echo.
)
start "Roar Web" cmd /k "cd /d %~dp0frontend\RoarFitness-Frontend\roarFitness && npm run dev"
start "Roar Fingerprint" cmd /k "cd /d %~dp0fingerprint\roar-fingerprint-simulator && if not exist node_modules npm install && npm run dev"
echo.
echo Keep the Roar API window open. ECONNREFUSED proxy errors mean the API is not running.
