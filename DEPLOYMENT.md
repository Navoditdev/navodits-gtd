# Own-account deployment

## Current state

The app is a working local-storage PWA with a private Sites preview. Vercel configuration and the first Supabase database migration are prepared. Supabase login, cloud sync, local-to-cloud import, and conflict resolution are the next implementation stage; adding environment variables alone does not enable them.

## Accounts and projects

1. Connect the Supabase and Vercel integrations, and select the intended projects. A new Supabase project can be named `navodits-gtd`.
2. Apply `supabase/migrations/202611060001_workspace.sql` to that project, then verify the access policies using an owner session, a different account, and an unauthenticated request. This migration has not been run against a live database yet.
3. Configure the app owner's Supabase Auth user and disable public signups for this personal installation. The Supabase dashboard login and the GTD app login are separate accounts.
4. Implement and verify authenticated sync before treating a Vercel deployment as the cloud version. Keep the existing private preview available during the transition.
5. Import `Navoditdev/navodits-gtd` into Vercel. Build command: `npm run build`. Output directory: `dist`. The repository includes `vercel.json`.
6. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel for the cloud-enabled app. A publishable key is intended for browser use and relies on the database access policies. Never put a secret or service-role key in browser code or Git.

## Data migration and checks

- Export a JSON backup from the current app before moving. Browser storage belongs to an origin; a new Vercel URL cannot read data stored at the private preview URL.
- Import the backup into the signed-in account with explicit confirmation.
- Check Android-to-desktop and desktop-to-Android changes, offline capture and reconnection, concurrent edits, deletions, and Saturday review deduplication.
- Confirm that signing out hides account data and that another account cannot access it.
- Open the production app online, allow the service worker to install, and check reopening it offline before installing the PWA on Android.

A custom domain can be added after the app is verified on its Vercel URL.
