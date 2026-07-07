@echo off
setlocal
echo Starting Roar Fitness Fingerprint Simulator...
echo.
echo Requires API on http://localhost:5188
echo Simulator UI: http://localhost:5190
echo.

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wait-for-api.ps1" 2>nul
if errorlevel 1 (
  echo API is not running. Starting backend in a new window...
  start "Roar API" cmd /k "cd /d %~dp0backend\RoarFitnessERP.Api && call run-api.cmd"
  echo Waiting for API to become ready...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wait-for-api.ps1"
  if errorlevel 1 (
    echo.
    echo API did not start in time. Open backend\RoarFitnessERP.Api\run-api.cmd manually, then rerun this script.
    pause
    exit /b 1
  )
)

cd /d "%~dp0fingerprint\roar-fingerprint-simulator"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

call npm run dev
