# Daylist — TODO app

A small full-stack task manager built with React, Express and MongoDB. Create, edit, complete and delete tasks, with search, status filters and a completion indicator. npm workspaces keep both applications in one repository.

## Quick start

Requires Node.js 22+ and a running MongoDB instance (local or Atlas).

```sh
npm ci
cp backend/.env.example backend/.env
# Edit backend/.env to set your MongoDB connection URI.
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to Express on port 3001. The backend connects to MongoDB before accepting requests. No sample tasks are inserted.

For local MongoDB with Docker, if installed:

```sh
docker run -d --name daylist-mongo -p 127.0.0.1:27017:27017 -v daylist-data:/data/db mongo:8
```

The named volume preserves data when the container is recreated. Later, use `docker start daylist-mongo`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start React and API with watch mode |
| `npm test` | API integration tests against a real temporary MongoDB process |
| `npm run build` | Build the React frontend |
| `npm start` | Start Express, serving the built frontend and API on port 3001 |

Run `npm run build` before `npm start`. Production deployments must provide `MONGODB_URI` via environment variables; `.env` is for local development and is ignored by Git.

## Architecture and choices

- `frontend/`: React with Vite. Component state is sufficient for this scope; HTTP calls use native fetch. No state-management or UI dependency is needed.
- `backend/`: Express 5, Mongoose model, and explicit request validation. Async route failures go through a JSON error handler. Helmet adds standard HTTP security headers.
- MongoDB stores title, optional description, completion status and timestamps. A pipeline update toggles completion atomically to avoid lost updates.
- Same-origin API requests simplify deployment and avoid permissive CORS configuration. Express serves the production React build.
- Completion changes update optimistically and roll back on failure. Creates and edits wait for server confirmation; delete requires confirmation. Per-task locks prevent duplicate mutations.

See [frontend instructions](frontend/README.md) and [backend instructions](backend/README.md).

## Scope and limitations

This is a single shared task list with no authentication, ownership, pagination or offline mode. Do not deploy it as a private multi-user task manager. Requests are limited to 16 KB; titles to 120 characters and descriptions to 2,000. Task times are stored but not displayed. Search and filters run on the loaded list. A toggle whose response is lost may require refreshing to reconcile with the database. Fonts load from Google Fonts with system fallbacks.

AI assistance was used to implement and document this project. Review your assessment's AI policy and disclose that assistance; the brief warns that large amounts of AI-generated code may disqualify a submission.
