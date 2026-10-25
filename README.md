# Decisions Todo App

A full-stack todo application with a React/Vite client, ASP.NET Core API, JWT authentication, and SQL Server storage.

## Prerequisites

- Node.js 20 or later
- .NET SDK 8 or later
- SQL Server Express or LocalDB, plus SQL Server Management Studio (SSMS)

## Database setup

1. Open SSMS and connect to your SQL Server instance.
2. Run [database/01_schema.sql](database/01_schema.sql). It creates `TodoAppDb`, its tables, indexes, and default categories.
3. Run [database/02_procedures.sql](database/02_procedures.sql). It installs every stored procedure used by authentication, category, and todo APIs.

Run the scripts in that order. The API requires the procedures in `02_procedures.sql`; for example, login requires `dbo.usp_Users_GetByEmail`.

## API setup

Update `Server/TodoApp.Api/appsettings.json` if your SQL Server instance is not `UPADHYAY\SQLEXPRESS`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=TodoAppDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Start the API:

```powershell
cd Server
dotnet run --project TodoApp.Api
```

The development API runs at `http://localhost:5284`; Swagger is available at `http://localhost:5284/swagger`.

## Client setup

```powershell
cd Client
npm install
npm run dev
```

Vite serves the client at `http://localhost:5173`, which is configured as an allowed CORS origin in the API.

To point the client to a different API URL, create `Client/.env.local`:

```env
VITE_API_URL=http://localhost:5284
```

## Client commands

Run these from `Client`:

- `npm run dev` — start the development server.
- `npm run build` — type-check and build a production bundle.
- `npm run lint` — run client lint checks.
