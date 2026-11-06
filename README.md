# Navodit's GTD

A dark-first, responsive personal GTD app for Android and desktop, inspired by the quiet interfaces of Linear, Notion, and Things.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Production build and local preview:

```sh
npm run build
npm run preview
```

## This first version

- Today: daily focus and upcoming deadlines.
- Inbox: capture, clarify, next actions, waiting for, someday, and completed tasks.
- What now: suggestions filtered by time, energy, context, planned dates, and active projects, plus an optional elapsed focus timer.
- Projects: coursework and personal categories, desired outcomes, next actions, active / paused / someday / complete states.
- Personal project limit: two or three active projects; enforced when creating, editing, activating, or converting an exploration.
- Calendar: month and agenda views, separate actual deadlines and planned work dates.
- Exploration: curiosity cards, editable notes, saved links, tags, and conversion to a personal project.
- Weekly review: six guided steps with a saved completion date.
- Dark and light appearance, keyboard capture (`N`), workspace search (`Ctrl/Cmd+K`).
- Browser storage, JSON backup export/import with validation, Android PWA installation, bundled fonts and an offline app shell.

The app starts with editable sample data. Data is stored **only in this browser on this device**. Phone and desktop do not sync yet. Browser data deletion removes the workspace, so keep exported backups. Importing replaces local data after confirmation. No real personal records or credentials are committed to the repository.

Open the production app online once and let its service worker install before using it offline. Install from Chrome's menu → Add to home screen / Install app. A hosted private preview may require owner authentication; offline support applies to the cached app after a successful online visit.

## Stack

React 19, TypeScript, Vite, Lucide icons, bundled Inter typography, CSS design tokens, localStorage, and a generated versioned service worker. Hosting is static; no server or API keys are required for this phase. `.openai/hosting.json` identifies the private Sites preview.

## Next phase

Authentication, a Supabase/Postgres data model with per-user access rules, cross-device sync and conflict handling, followed by recurring tasks, reminders, and external calendar integrations. Those features are not implemented in this version.
