@echo off
REM Do not run "dotnet watch run" directly — use this script instead.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-api-watch.ps1"
exit /b %ERRORLEVEL%
