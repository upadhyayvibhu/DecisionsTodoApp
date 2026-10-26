# Decisions Todo App Documentation

## Purpose

Decisions Todo App helps authenticated users manage their own todos. A user can register, sign in, create categories, add todos, filter their list, mark items complete, edit them, and delete them.

## Architecture

```text
React client (Client)
        |
        | HTTP requests with a JWT bearer token
        v
ASP.NET Core API (Server/TodoApp.Api)
        |
        | Dapper + stored procedures
        v
SQL Server (TodoAppDb)
```

### Client

The client uses React, TypeScript, and Vite. `src/components` contains UI and feature components, `src/pages/Dashboard.tsx` combines the dashboard sections, and `src/hooks/useTodos.ts` loads data and exposes todo actions. The `src/api` folder contains HTTP requests, API types, and browser-session handling. `src/mappers` converts API response objects into the shapes used by the UI.

The login session is stored in browser local storage. When the API reports that the session has expired, the client clears it and returns the user to the authentication page.

### Server

The API follows a layered layout:

- `Controllers` receive HTTP requests and return responses.
- `Services` contain application rules such as ownership checks and authentication.
- `Repositories` run SQL Server stored procedures through Dapper.
- `Validators` validate incoming request data.
- `Middleware` and exception handling return consistent `ProblemDetails` error responses.
- `Models` contains entities, data-transfer objects, mappings, and enums.

JWT authentication protects todo and category endpoints. The authenticated user ID is used for every data operation, so users can access only their own todos and personal categories.

### Database

`TodoAppDb` contains `Users`, `Categories`, `Priorities`, and `Todos`. The application uses the stored procedures defined in `database/02_procedures.sql` for database access.

## Features

- Account registration and login
- JWT-based authentication
- Create, edit, complete, and delete todos
- Todo search, pagination, and filters for category, priority, and completion status
- Default system categories: Work, Personal, and Other
- Create and rename personal categories
- Dashboard statistics
- Light and dark themes
- Responsive authentication screen

## API reference

All request and response bodies use JSON. Protected endpoints require this header:

```http
Authorization: Bearer <token>
```

| Method | Route | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create an account and receive a session token. |
| `POST` | `/api/auth/login` | No | Sign in and receive a session token. |
| `GET` | `/api/todos` | Yes | Search, filter, sort, and paginate todos. |
| `GET` | `/api/todos/{id}` | Yes | Get one todo. |
| `POST` | `/api/todos` | Yes | Create a todo. |
| `PUT` | `/api/todos/{id}` | Yes | Update a todo. |
| `PATCH` | `/api/todos/{id}/status` | Yes | Change a todo's completion status. |
| `DELETE` | `/api/todos/{id}` | Yes | Delete a todo. |
| `GET` | `/api/categories` | Yes | Get system and personal categories. |
| `POST` | `/api/categories` | Yes | Create a personal category. |
| `PUT` | `/api/categories/{id}` | Yes | Rename a personal category. |

### Todo query parameters

| Parameter | Example | Meaning |
| --- | --- | --- |
| `search` | `search=report` | Matches todo text. |
| `priority` | `priority=High` | Filters by Low, Medium, or High priority. |
| `categoryId` | `categoryId=1` | Filters by category. |
| `isCompleted` | `isCompleted=false` | Filters by completion state. |
| `sortBy` | `sortBy=created` | Sorts by `created`, `dueDate`, or `priority`. |
| `page` | `page=1` | Selects the result page. |
| `pageSize` | `pageSize=9` | Sets the number of items per page. |

## Development and testing

```powershell
# Client
cd Client
npm run build
npm run lint

# Server
cd ../Server
dotnet test TodoApp.sln
```

The client lint command currently reports one known warning from TanStack Table and React Compiler compatibility. It does not indicate a failed lint run.

## Security notes

- The client can read only `VITE_` variables, and those values are public in the browser. Never place secrets in a client `.env` file.
- Store local server secrets in the ignored `Server/TodoApp.Api/.env` file. Use the committed `.env.example` as a guide.
- Never commit a production JWT signing key or database password.
- Keep production connection strings and secrets in hosting environment variables or a secret manager.
- Use HTTPS in production.
- Set explicit production CORS origins instead of allowing every origin.
