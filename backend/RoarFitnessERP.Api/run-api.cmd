@echo off
cd /d "%~dp0"
call "%~dp0stop-api.cmd"
echo Cleaning and building...
dotnet clean --verbosity quiet
dotnet build
if errorlevel 1 (
    echo Build failed. Fix errors above, then run run-api.cmd again.
    exit /b 1
)
echo Starting API on http://localhost:5188 ...
dotnet watch run --launch-profile http --non-interactive
