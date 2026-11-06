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
- Weekly review: an automatic all-day task every Saturday, with a 20-minute estimate and six guided steps. It appears in Today on Saturday and stays visible if overdue. Completing the task or guided checklist closes that occurrence and schedules the following Saturday; repeated completion in the same cycle does not skip a week. Missed weeks keep one overdue task rather than creating a backlog. Dates use the device’s local calendar; no timed or push notification is sent.
- Dark and light appearance, keyboard capture (`N`), workspace search (`Ctrl/Cmd+K`).
- Browser storage, JSON backup export/import with validation, Android PWA installation, bundled fonts and an offline app shell.

Legacy workspaces with three active personal projects are migrated to two: the first two stay active and additional projects move to Paused, with a visible notice and every action/note preserved. Older JSON backups remain importable.

With Supabase configured, the app requires the owner’s email-link sign-in and starts with an empty workspace plus the Saturday review. It syncs across signed-in devices and caches offline edits per account. Concurrent changes require an explicit choice between device and cloud copies, with a backup download. Importing replaces the workspace and syncs that replacement. Without Supabase configuration, the local preview uses editable sample data and browser-only storage. Keep exported backups.

Open the production app online once and let its service worker install before using it offline. Install from Chrome's menu → Add to home screen / Install app. A hosted private preview may require owner authentication; offline support applies to the cached app after a successful online visit.

## Stack

React 19, TypeScript, Vite, Supabase Auth/Postgres, Lucide icons, bundled Inter typography, CSS design tokens, localStorage, and a generated versioned service worker. Vercel hosts the static PWA. `.openai/hosting.json` identifies the older private Sites preview. See DEPLOYMENT.md for configuration.

## Next phase

General recurring tasks, timed reminders, automatic conflict merging, and external calendar integrations are not implemented. Weekly Saturday reviews are recurring already.
