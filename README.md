# Daylist

A TODO app built with React, Express and MongoDB. You can add tasks, edit their details, mark them as done and delete them. There’s also a search box, status filters and a progress indicator.

## Getting started

You’ll need Node.js 22 or newer and either a local MongoDB instance or an Atlas connection.

From the project root:

```sh
npm ci
cp server/.env.example server/.env
```

Set `MONGODB_URI` in `server/.env`, then start the app:

```sh
npm run dev
```

Open http://localhost:5173. This starts both servers: Vite handles the frontend and forwards API requests to Express on port 3001. The list starts empty, so add a task to try it out.

If you have Docker installed, you can start a local database with:

```sh
docker run -d --name daylist-mongo -p 127.0.0.1:27017:27017 -v daylist-data:/data/db mongo:8
```

The example connection string works with this setup. The volume keeps your tasks when the container is recreated. To start the same container later, run `docker start daylist-mongo`.

## Configuration

The backend reads `server/.env`. The frontend does not need an environment file.

| Variable | Required | Value |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string; the example uses `mongodb://127.0.0.1:27017/todo_app` |
| `PORT` | No | Express port; defaults to `3001` |

If you change `PORT` during development, update the API proxy target in `client/vite.config.js` to match. Restart the backend after changing its environment variables.

For MongoDB Atlas, configure a database user and allow your machine's IP address in Network Access. Put the connection string in `server/.env`, including the database name. URL-encode special characters in the username or password, and keep credentials out of Git.

## Using Daylist

1. Enter a task title and an optional description, then submit the form.
2. Use the checkbox to mark a task completed or active again.
3. Choose Edit to load a task into the form. Save your changes or use Cancel to keep the existing details.
4. Search by title or description, and use All, Active or Completed to narrow the list.
5. Choose Delete and confirm to permanently remove a task.

Tasks appear newest first. The progress indicator counts the full list, even when a search or status filter hides some tasks. Tasks are saved in MongoDB and remain available after restarting the app.

## Useful commands

Run these from the project root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the frontend and backend in watch mode |
| `npm test` | Runs the API tests with a temporary MongoDB database |
| `npm run build` | Builds the frontend into `client/dist` |
| `npm start` | Starts Express and serves the built frontend on port 3001 |

For the production setup, run `npm run build` before `npm start`. Set `MONGODB_URI` in the deployment environment; don’t commit database credentials.

To try the production build locally:

```sh
npm run build
npm start
```

Open http://localhost:3001. Express serves both the built frontend and the API from this address. Run the build again after changing frontend code.

## API quick reference

The API base path is `/api`. During local development, you can call Express directly at http://localhost:3001.

| Method | Endpoint | Purpose | Success status |
| --- | --- | --- | --- |
| GET | `/api/todos` | List all tasks, newest first | 200 |
| POST | `/api/todos` | Create a task | 201 |
| PUT | `/api/todos/:id` | Update title and description | 200 |
| PATCH | `/api/todos/:id/done` | Toggle completion; no request body needed | 200 |
| DELETE | `/api/todos/:id` | Delete a task | 204 |

For example, create a task with:

```sh
curl -X POST http://localhost:3001/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Plan the week","description":"Review upcoming tasks"}'
```

POST and PUT require a nonblank title. A new task starts with `done: false`. PUT changes only the title and description; omitting the description clears it. Use the PATCH endpoint to change completion status.

Errors return a JSON object such as `{"error":"Invalid task ID."}`. Invalid input returns 400, missing tasks return 404, oversized request bodies return 413, and unexpected server errors return 500. See the [backend README](server/README.md) for the response format and validation details.

## Verification

Run `npm test` for the API integration tests. They use a temporary MongoDB process and do not modify the database configured in `server/.env`. The first run needs internet access to download the MongoDB binary.

The tests cover task creation, persistence, editing, deletion, input validation, invalid and missing IDs, request-size limits and concurrent completion toggles. Run `npm run build` to check that the frontend compiles.

For a browser check, add a task, edit it, toggle its status, try search and filters, and refresh the page to confirm it remains saved. Delete the task and refresh again to confirm removal. Browser interactions currently need manual verification.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `MONGODB_URI is required` | Copy `server/.env.example` to `server/.env` and set the connection string. |
| `Could not start API` or a database connection error | Confirm MongoDB is running and the URI is correct. For Atlas, check credentials and Network Access. The API waits for a database connection before listening. |
| The frontend opens but tasks do not load | Check the backend terminal for errors and confirm the proxy in `client/vite.config.js` matches the backend port. |
| `EADDRINUSE` when starting Express | Stop the process using port 3001 or set a different `PORT` and update the development proxy. |
| The page is unavailable after `npm start` | Run `npm run build` first, then open the Express address, http://localhost:3001 by default. |
| The MongoDB test binary fails to download | Check your network or proxy settings, then rerun `npm test`. |

## How it’s put together

```text
todo-app/
├── client/          # React frontend
│   ├── src/
│   └── README.md
├── server/          # Express API and MongoDB model
│   ├── src/
│   ├── test/
│   └── README.md
├── package.json     # Workspace scripts
└── README.md
```

The repo uses npm workspaces, with the React app in `client/` and the Express API in `server/`. Each has its own [frontend README](client/README.md) or [backend README](server/README.md) with setup details.

React state handles the list and form, and `fetch` handles API calls. The app is small enough that a separate state library would add little here. The same form handles adding and editing tasks.

The API validates incoming fields before passing them to Mongoose. MongoDB stores the task title, description, done status and timestamps. Completion toggles happen in one database update, so overlapping requests don’t overwrite each other’s changes.

Checking a task updates the screen immediately. If the request fails, the checkbox goes back and an error appears. Adding and editing wait for the server response, and deleting asks for confirmation first.

## Things to know

- There’s one shared list, with no login or task ownership.
- All tasks load together. Search and filters run in the browser; there’s no pagination.
- Titles are limited to 120 characters and descriptions to 2,000. Request bodies are limited to 16 KB.
- There’s no offline mode or delete undo. If a connection drops after a toggle reaches the server, refresh the list to check its saved status.
- Fonts come from Google Fonts, with system fonts as a fallback.
