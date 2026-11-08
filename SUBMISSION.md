# Submission preparation

## Remaining account and recording steps

- Create a **public repository in your own GitHub account**.
- Push both `main` and `develop`; set `main` as the default branch.
- Open a pull request from `develop` to `main` using `.github/pull_request_template.md`.
- Record and link a short working demo and a five-minute code walkthrough. Suggested scripts are below.
- Fill out the submission form linked in the assessment email.
- Disclose AI assistance and confirm eligibility under the assessment policy.

These account-specific actions and recordings have not been completed by the implementation process.

After creating an empty GitHub repository, use its real URL:

```sh
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
git push -u origin develop
```

## Short demo (about 90 seconds)

1. Start with an empty list and add a title-only task, then one with a description.
2. Edit a task, cancel another edit, and show required-field validation.
3. Mark a task complete and undo it; show the progress indicator and filters.
4. Search by description, then delete a task after confirmation.
5. Reload the browser to demonstrate MongoDB persistence.
6. Briefly stop the backend, demonstrate a recoverable error, restart and refresh.

## Five-minute code walkthrough

- 0:00–0:45: Workspace structure, root scripts, development proxy and production serving.
- 0:45–1:30: Mongoose schema, validation and environment configuration.
- 1:30–2:30: Five Express routes, atomic toggling, statuses and error handling.
- 2:30–3:45: React state, shared form, HTTP helper, optimistic updates and rollback.
- 3:45–4:30: Run tests; explain isolated MongoDB and concurrency verification.
- 4:30–5:00: Responsive/accessibility choices, assumptions and scope limits.

## Manual UI acceptance checklist

- At desktop and mobile widths, create, edit, cancel, toggle and delete.
- Check title whitespace/length and description length, plus empty/filter/search states.
- Tab through controls and verify focus styles and checkbox labels.
- Disable networking, toggle a task and check rollback and the error message.
- Restart backend and verify refresh recovery; reload and verify persistence.
- Confirm the built frontend works through Express with `npm run build && npm start`.
