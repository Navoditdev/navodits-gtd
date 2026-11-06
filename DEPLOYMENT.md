# Own-account deployment

## Current state

The app includes Supabase email-link sign-in and account-scoped offline caching. Cloud saves use revision checks: changes on two devices require an explicit choice and offer a device backup before replacing either copy. Sync runs after edits, on reconnect/focus, and every 15 seconds while open. This version does not merge concurrent edits automatically.

The workspace schema has been applied to Supabase project `zsktdwvsgfykluvfshxl`. Both tables have row-level security. Workspace access requires the signed-in user's ID and the owner email in the administrator-managed access table. The Supabase security advisor reported no findings after setup.

Production is deployed at https://navodits-gtd.vercel.app in Vercel scope `mango-2089` (Hobby). The production sign-in screen loads successfully. Supabase Auth Site URL/redirect allowlist setup and an authenticated end-to-end check are still pending. The GitHub repository is connected for future deployments.

## Vercel configuration

- Project/repository: `Navoditdev/navodits-gtd`.
- Framework: Vite. Build: `npm run build`. Output: `dist`.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel. These are browser-visible values; never use a secret/service-role key.
- Set the production URL as Supabase Auth Site URL and add it to permitted redirect URLs. The sign-in screen requests a magic link returning to the current origin.
- Supabase Auth must allow the owner's first email signup. Database access remains limited to the allowlisted owner, even if another account signs up. After the first owner login, public signup can be disabled in the dashboard.
- Default Supabase email delivery may be limited to project-team addresses. Use custom SMTP if broader email delivery is needed.

## Moving existing data

Export a JSON backup from the old preview. Browser storage belongs to an origin; Vercel cannot read the preview's storage. Sign into the deployed app, then import the backup from workspace settings. Fresh cloud workspaces start empty, with the automatic Saturday review task.

## Checks before relying on cloud sync

Confirm email-link login, Android-to-desktop changes, offline capture/reconnection, simultaneous edits, and sign-out. The app shell remains a PWA and caches static files; Supabase API responses are not service-worker cached. An offline cache is retained per account on the device after sign-out and can be reopened only after that account signs in again. Use trusted devices and export backups regularly.
