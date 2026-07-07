# Roar Fitness — Fingerprint Biometric Simulator

React app that simulates the gym fingerprint scanner and front-desk enrollment. It talks to the same Roar Fitness ERP API as the main web app (`http://localhost:5188`).

## Run

**Recommended:** from the project root:

```cmd
start-fingerprint-simulator.cmd
```

This starts the API if needed, waits until it is ready, then launches the simulator on port **5190**.

Or manually:

1. Start the API first: `backend\RoarFitnessERP.Api\run-api.cmd` (must stay open on port **5188**)
2. Install and run the simulator:

```cmd
cd fingerprint\roar-fingerprint-simulator
npm install
npm run dev
```

Open **http://localhost:5190**

The simulator calls `http://localhost:5188/api` directly in dev (see `.env.development`), so you will not see Vite proxy errors when the API is offline — the UI shows an **API offline** banner instead.

If port **5190** is already in use, stop the other simulator/dev server or run: `npx kill-port 5190`

## Features

| Tab | Purpose |
|-----|---------|
| **Gate Scan** | Simulates entry scanner — POST `/api/attendance/scan` (no login) |
| **Enroll Fingerprint** | Assign unique PIN to member/instructor — POST activate endpoints (admin login) |
| **Today's Logs** | View scan history — GET `/api/attendance/logs/today` |

## Fingerprint PIN format

Each person gets one unique template ID, e.g. `RF-FP-MEM-12-A1B2C3D4`. This maps to `FingerprintTemplateId` in the database.

## Default admin login

- Email: `admin@roarfitness.lk`
- Password: `Admin@123`

## Ports

| Service | URL |
|---------|-----|
| API | http://localhost:5188 |
| Main frontend | http://localhost:5173 |
| Fingerprint simulator | http://localhost:5190 |
