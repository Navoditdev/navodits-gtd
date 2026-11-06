# Navodit's GTD

A dark-first, responsive personal GTD app for Android and desktop, with an editorial, Substack-inspired paper feel: serif headings, warm orange accents, and a warm ink dark theme.

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
- Personal project limit: exactly two **active personal projects**; paused, someday and completed projects are unlimited. Coursework and ongoing practices do not count. Enforced when creating, editing, activating, converting, importing and loading legacy data.
- Practices: ongoing learning threads (such as backend learning or LeetCode), with a gentle rhythm, notes and resources, dated session history, a where-you-left-off summary, and optional next actions that appear in What now. Rhythms are descriptive; automated recurrence/reminders are not implemented.
- Calendar: month and agenda views, separate actual deadlines and planned work dates.
- Exploration: curiosity cards, editable notes, saved links, tags, and conversion to a personal project.
- Weekly review: six guided steps with a saved completion date.
- Dark and light appearance, keyboard capture (`N`), workspace search (`Ctrl/Cmd+K`).
- Browser storage, JSON backup export/import with validation, Android PWA installation, bundled fonts and an offline app shell.

Legacy workspaces with three active personal projects are migrated to two: the first two stay active and additional projects move to Paused, with a visible notice and every action/note preserved. Older JSON backups remain importable.

The app starts with editable sample data. Data is stored **only in this browser on this device**. Phone and desktop do not sync yet. Browser data deletion removes the workspace, so keep exported backups. Importing replaces local data after confirmation. No real personal records or credentials are committed to the repository.

Open the production app online once and let its service worker install before using it offline. Install from Chrome's menu → Add to home screen / Install app. A hosted private preview may require owner authentication; offline support applies to the cached app after a successful online visit.

## Stack

React 19, TypeScript, Vite, Lucide icons, bundled Inter typography, CSS design tokens, localStorage, and a generated versioned service worker. Hosting is static; no server or API keys are required for this phase. `.openai/hosting.json` identifies the private Sites preview.

## Next phase

Authentication, a Supabase/Postgres data model with per-user access rules, cross-device sync and conflict handling, followed by recurring tasks, reminders, and external calendar integrations. Those features are not implemented in this version.
