# Decisions Todo App

A full-stack todo application for creating, organizing, filtering, and completing personal tasks. The project has a React client, an ASP.NET Core API, JWT authentication, and SQL Server storage.

## Project structure

| Folder | Purpose |
| --- | --- |
| [Client](Client/README.md) | React, TypeScript, and Vite user interface. |
| [Server](Server/README.md) | ASP.NET Core API and automated tests. |
| [database](database) | SQL Server schema and stored procedures. |
| [DOCUMENTATION.md](DOCUMENTATION.md) | Architecture, features, and API reference. |

## Prerequisites

- Node.js 20 or later
- .NET 10 SDK
- SQL Server Express, LocalDB, or another SQL Server instance
- SQL Server Management Studio (SSMS) or Azure Data Studio

## Quick start

### 1. Create the database

Open SSMS or Azure Data Studio and run the scripts in this order:

1. [database/01_schema.sql](database/01_schema.sql)
2. [database/02_procedures.sql](database/02_procedures.sql)

The first script creates the `TodoAppDb` database, tables, indexes, priorities, and default categories. The second script creates the stored procedures used by the API.

### 2. Configure the API

Copy `Server/TodoApp.Api/.env.example` to `Server/TodoApp.Api/.env`, then set your local SQL Server connection string and JWT key. The `.env` file is ignored by Git.

For production, set the values in `Server/TodoApp.Api/.env.production.example` through your host's environment-variable or secret-management settings. Do not commit or deploy a production `.env` file.

### 3. Start the API

```powershell
cd Server
dotnet run --project TodoApp.Api
```

The API runs at `http://localhost:5284`. In the Development environment, Swagger is available at `http://localhost:5284/swagger`.

### 4. Start the client

Open a second terminal:

```powershell
cd Client
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. Register a new account, then create and manage todos.

## Configuration

The client reads its API URL from `Client/.env.local`. To use a different local API URL, update:

```env
VITE_API_URL=http://localhost:5284
```

If the client runs from another origin, add that origin to `Cors:AllowedOrigins` in the API configuration.

Only `VITE_` variables can be read by the client, and every such value is visible in the browser. Never put a database connection string, password, or JWT key in a client `.env` file.

## Useful commands

### Client

Run these commands from `Client`:

```powershell
npm run dev
npm run build
npm run lint
```

### Server

Run these commands from `Server`:

```powershell
dotnet build TodoApp.sln
dotnet test TodoApp.sln
dotnet run --project TodoApp.Api
```

## More documentation

Read [DOCUMENTATION.md](DOCUMENTATION.md) for the application architecture, feature list, request flow, and endpoint summary.
