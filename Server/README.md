# Decisions Todo App Server

The server is an ASP.NET Core 10 Web API that provides authentication, category management, and todo management for the Decisions Todo App client.

## Projects

| Project | Purpose |
| --- | --- |
| `TodoApp.Api` | Web API, application logic, database access, validation, and Swagger setup. |
| `TodoApp.Tests` | Unit tests for services and validators. |

## Requirements

- .NET 10 SDK
- SQL Server with the scripts in `../database` run in order

## Configuration

Set the SQL Server connection string in `TodoApp.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=TodoAppDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

For local development, the API uses a development JWT key from `TodoApp.Api/appsettings.Development.json`. Use a secure value outside source control for real deployments.

The API accepts requests from `http://localhost:5173` by default. Update `Cors:AllowedOrigins` if your client uses a different URL.

## Run and test

Run these commands from this folder:

```powershell
dotnet restore TodoApp.sln
dotnet build TodoApp.sln
dotnet test TodoApp.sln
dotnet run --project TodoApp.Api
```

The development API starts at `http://localhost:5284`. Swagger is available at `http://localhost:5284/swagger`.

## API areas

- `POST /api/auth/register` and `POST /api/auth/login` are public.
- `/api/todos` endpoints require a JWT bearer token.
- `/api/categories` endpoints require a JWT bearer token.

Read the [root documentation](../DOCUMENTATION.md) for the endpoint list, architecture, and request flow.
