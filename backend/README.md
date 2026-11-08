# Backend

An Express 5 API backed by MongoDB, with Mongoose handling the task model.

## Running locally

You’ll need Node.js 22 or newer and a MongoDB connection. From the repository root:

```sh
npm ci
cp backend/.env.example backend/.env
```

Set `MONGODB_URI` in `backend/.env`. For a local database, the example uses:

```text
mongodb://127.0.0.1:27017/todo_app
```

For Atlas, create a database user, allow your machine’s IP under Network Access and copy the `mongodb+srv://` connection string into `.env`. URL-encode any special characters in the username or password. Keep this file out of Git.

Then start the API:

```sh
npm run dev -w backend
```

The default port is 3001; set `PORT` to change it. The server connects to MongoDB before it starts listening. If the URI is missing or the connection fails, it exits with an error.

For production, run `npm start` from the root. Express also serves `frontend/dist` if you’ve built the frontend. SIGINT and SIGTERM close the server and database connection.

## API

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/todos` | All tasks, newest first (200) |
| POST | `/api/todos` | Creates and returns a task (201) |
| PUT | `/api/todos/:id` | Updates and returns a task (200) |
| PATCH | `/api/todos/:id/done` | Toggles completion and returns the task (200) |
| DELETE | `/api/todos/:id` | Deletes the task (204, no body) |

POST and PUT accept:

```json
{
  "title": "Plan the week",
  "description": "Optional details"
}
```

The title is required and must contain 1–120 characters after trimming. Description is optional and can contain up to 2,000 characters. Leaving it out of a PUT request clears the saved description. Both fields are trimmed before saving.

Returned tasks contain `_id`, `title`, `description`, `done`, `createdAt` and `updatedAt`. PUT only accepts title and description; completion changes use the PATCH route. The toggle happens in one MongoDB update to avoid losing changes when requests overlap.

Errors use this format:

```json
{ "error": "Readable message" }
```

Invalid fields, malformed JSON and invalid IDs return 400. Missing tasks or API routes return 404, oversized bodies return 413, and unexpected errors return 500. Internal error details stay in the server logs.

## Tests

From the repository root:

```sh
npm test
```

The tests use Supertest and a temporary MongoDB process. They don’t use your configured database. The first run needs internet access to download the MongoDB binary.

The suite checks CRUD and persistence, rejected input, missing tasks, request-size limits, preservation of completion status during edits and concurrent toggles.

## Limits

This is a shared task list without authentication, ownership, rate limiting or pagination. It’s intended for the assignment’s local setup. Vite proxies API requests during development; Express serves both parts in production. Separate-origin hosting would need CORS configuration.
