# Backend

Express 5 REST API with Mongoose and MongoDB persistence.

## Setup

Use Node.js 22+ and MongoDB locally or Atlas. From the repository root:

```sh
npm ci
cp backend/.env.example backend/.env
npm run dev -w backend
```

Configure `MONGODB_URI` in `backend/.env`. The local default is `mongodb://127.0.0.1:27017/todo_app`. For Atlas, create a database user, allow your machine's IP in Network Access, and use the Atlas `mongodb+srv://` connection string with URL-encoded credentials. Keep credentials out of Git. `PORT` defaults to 3001.

The server refuses to start without a URI or a successful database connection. SIGINT/SIGTERM close the HTTP server and database connection. For production use `npm start` from the root; a previously built frontend is served if present.

## REST API

| Method | Endpoint | Request / response |
| --- | --- | --- |
| GET | `/api/todos` | 200, array newest first |
| POST | `/api/todos` | `{ "title": "Task", "description": "Optional" }`; 201, task |
| PUT | `/api/todos/:id` | Required title and optional description; 200, updated task |
| PATCH | `/api/todos/:id/done` | No body; 200, task with toggled status |
| DELETE | `/api/todos/:id` | 204, no body |

Task fields: `_id`, `title`, `description`, `done`, `createdAt`, `updatedAt`. Titles and descriptions are trimmed. Title must be 1–120 characters after trimming; description must be a string of up to 2,000 characters. Omitting description on PUT resets it to an empty string. Clients cannot update completion through PUT or inject arbitrary model fields. Completion uses an atomic pipeline update.

Errors return `{ "error": "Readable message" }`: 400 for malformed JSON, invalid fields or IDs, 404 for missing tasks/routes, 413 for oversized requests, 500 for unexpected errors. Internal errors are logged server-side without exposing details in responses.

## Tests

```sh
npm test
```

Tests download a MongoDB binary on their first run, start a temporary isolated MongoDB process, and use Supertest. No production URI is read. Coverage includes CRUD/persistence, field validation, malformed JSON, request-size limits, missing IDs, status preservation and concurrent toggles. Internet access is required for the first binary download.

## Assumptions and limitations

No authentication, rate limiting, task ownership or pagination. All users share one list. Use a trusted local environment for this exercise. Development accesses the API through the Vite proxy; production serves both applications from Express. No separate-origin CORS configuration is included.
