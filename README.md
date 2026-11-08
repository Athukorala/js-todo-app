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

## Useful commands

Run these from the project root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the frontend and backend in watch mode |
| `npm test` | Runs the API tests with a temporary MongoDB database |
| `npm run build` | Builds the frontend into `client/dist` |
| `npm start` | Starts Express and serves the built frontend on port 3001 |

For the production setup, run `npm run build` before `npm start`. Set `MONGODB_URI` in the deployment environment; don’t commit database credentials.

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

AI assistance was used for implementation and documentation.
