# Roar Fitness ERP

Gym ERP for **Roar Fitness**, Colombo, Sri Lanka — ASP.NET Core API + React frontend + SQL Server.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) (or v21)
- **SQL Server** (LocalDB, Express, or full) running locally
- VS Code extensions (recommended): C# Dev Kit, NuGet Gallery, ESLint, MSSQL

## Quick start

### 1. Start the API (required first)

```powershell
cd C:\Users\HP\RoarFitnessERP\backend\RoarFitnessERP.Api
dotnet watch run
```

API: http://localhost:5188  
Swagger: http://localhost:5188/swagger  
**Scalar API docs:** http://localhost:5188/scalar/v1  
OpenAPI JSON: http://localhost:5188/swagger/v1/swagger.json

On first run, the app creates the `RoarFitnessERPDB` database on SQL Express and seeds demo data.

**Default admin login**
- Email: `admin@roarfitness.lk`
- Password: `Admin@123`

### 2. Start the React frontend

Open a **second terminal**:

```powershell
cd C:\Users\HP\RoarFitnessERP\frontend\roar-fitness-web
npm install
npm run dev
```

Website: http://localhost:5173

> **Important:** Do not open `index.html` directly in the browser. React + Vite must run through `npm run dev`.

## Database connection

Edit `backend/RoarFitnessERP.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=HASHJAY\\SQLEXPRESS;Database=RoarFitnessERPDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
}
```

For a different machine, replace `HASHJAY\\SQLEXPRESS` with your SQL Server instance name.

## Project layout

```
RoarFitnessERP/
├── backend/RoarFitnessERP.Api/   # ASP.NET Core REST API
├── frontend/roar-fitness-web/    # React public site + dashboards
├── database/scripts/             # SQL schema scripts (reference)
└── docs/API-REFERENCE.md         # API endpoints
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `MSB3027` / file locked by `RoarFitnessERP.Api` | Another API instance is still running. Run `.\stop-api.ps1` in the API folder, or `Stop-Process -Name RoarFitnessERP.Api -Force`, then `dotnet watch run` again |
| API crash on startup | Ensure SQL Server is running and connection string is correct |
| Blank frontend | Run `npm run dev`, visit http://localhost:5173 |
| CORS / API errors | Keep API on port 5188 and frontend on 5173 |
| Stale database after schema change | Drop database `RoarFitnessERPDB` in SSMS and restart API |
