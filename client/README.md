# Frontend

The UI uses React 19, Vite and plain CSS. API requests use `fetch`.

## Running locally

Use Node.js 22 or newer. From the repository root:

```sh
npm ci
npm run dev -w client
```

Open http://localhost:5173. You’ll also need the backend running in another terminal:

```sh
npm run dev -w server
```

Or use `npm run dev` at the root to start both together. The backend README covers the database setup.

Vite forwards `/api` requests to http://127.0.0.1:3001. If you change the backend port, update the proxy in `vite.config.js` too. The frontend doesn’t need an `.env` file.

## Building

```sh
npm run build -w client
```

This writes the build to `client/dist`. Run `npm start` at the repository root to serve it through Express at http://localhost:3001.

## Using the app

Add a title and, if needed, a description. Edit opens the task in the same form; Cancel leaves the saved task alone. Blank or whitespace-only titles aren’t accepted.

The checkbox updates straight away and goes back if saving fails. Other saves wait for a response from the API. Failed saves keep your form content so you can try again. Delete asks for confirmation.

Search checks both titles and descriptions. The All, Active and Completed buttons filter the loaded tasks. Loading, empty and error messages appear in the list area, with a Refresh list button when a request fails.

The layout adapts to smaller screens. Inputs have labels, keyboard focus is visible, status changes have live announcements, and animations respect reduced-motion settings.

## Limits and checks

There’s no login, offline support, pagination or delete undo. Everyone using the same backend sees the same list. Conflicting actions are disabled while a save is in progress.

Run `npm test` from the root for the API integration tests. Browser interaction checks still need to be done manually.
