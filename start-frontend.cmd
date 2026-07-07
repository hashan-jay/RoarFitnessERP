@echo off
cd /d "%~dp0frontend\RoarFitness-Frontend\roarFitness"
echo Starting frontend on http://localhost:5200
echo (API: 5188 ^| Fingerprint: 5190)
npm run dev
