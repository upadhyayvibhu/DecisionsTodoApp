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

For local development, copy `TodoApp.Api/.env.example` to `TodoApp.Api/.env` and fill in the connection string and JWT key. The API loads this local file at startup, and Git ignores it.

For production, use the environment variables documented in `TodoApp.Api/.env.production.example`. Configure those values in your hosting platform's secret manager or environment settings; do not deploy a production `.env` file.

The API accepts requests from `http://localhost:5173` by default. Set `Cors__AllowedOrigins__0` to the client URL for each environment.

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
