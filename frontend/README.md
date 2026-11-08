# Frontend

React 19 and Vite, using plain CSS and native fetch.

## Setup

From the repository root, use Node.js 22+:

```sh
npm ci
npm run dev -w frontend
```

Open http://localhost:5173. Run the backend separately with `npm run dev -w backend`, or run both with `npm run dev` from the root.

`npm run build -w frontend` writes `frontend/dist`. For production, build first and run `npm start` at the root: Express serves both frontend and API from http://localhost:3001.

Vite proxies `/api` to http://127.0.0.1:3001. If the backend port changes, update `vite.config.js`. There are no frontend secrets or environment variables.

## Behavior

- Add a required title and optional description; whitespace-only titles are rejected.
- Edit through the same form, or cancel without saving.
- Toggle completion optimistically, with a rollback and error message on failure.
- Delete after confirmation; search title/description and filter by status.
- Loading, empty and error states; retry via Refresh list.
- Responsive layout, labeled inputs, keyboard focus styles, live status announcements and reduced-motion support.

## Assumptions and limitations

A shared list without login, pagination or offline support. All tasks load at once; filtering is client-side. Delete has confirmation but no undo. Failed saves preserve form content. The UI disables conflicting actions while saving. API integration tests run via root `npm test`.
