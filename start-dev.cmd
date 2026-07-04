@echo off
setlocal
echo Starting Roar Fitness ERP dev stack...
echo.
echo 1) API  -> http://localhost:5188
echo 2) Web  -> http://localhost:5173
echo.
start "Roar API" cmd /k "cd /d %~dp0backend\RoarFitnessERP.Api && call run-api.cmd"
timeout /t 8 /nobreak >nul
start "Roar Web" cmd /k "cd /d %~dp0frontend\roar-fitness-web && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Keep the API window open — Vite proxy errors mean the API is not running.
