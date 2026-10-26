# Decisions Todo App Client

The client is a React and TypeScript single-page application built with Vite. It provides account registration and login, todo management, categories, search, filters, dashboard statistics, and theme switching. It saves data through the ASP.NET Core API; it does not use in-memory sample data.

## Requirements

- Node.js 20 or later
- The API running at `http://localhost:5284` by default

## Start the client

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` after Vite starts.

## API URL

Create `.env.local` to override the default API URL:

```env
VITE_API_URL=http://localhost:5284
```

The selected API origin must also be included in the server's CORS configuration.

## Commands

```powershell
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint checks
npm run preview  # Preview the production build
```

## Key folders

| Path | Purpose |
| --- | --- |
| `src/api` | API requests, session storage, and API contract types. |
| `src/components` | Reusable UI, authentication, category, and todo components. |
| `src/hooks` | Reusable state and browser-behavior logic. |
| `src/mappers` | Converts API response objects into UI models. |
| `src/pages` | Page-level components, including the dashboard. |
| `src/types` | Client-specific TypeScript types. |

For the complete project setup and API summary, see the [root README](../README.md) and [documentation](../DOCUMENTATION.md).
