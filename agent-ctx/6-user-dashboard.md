# Task 6: User Dashboard Builder

## Files Created

### Dashboard Layout & Shared Components
- `src/app/dashboard/layout.tsx` — server component that calls `requireAuth()` and wraps everything in `DashboardShell`
- `src/components/dashboard/dashboard-shell.tsx` — client shell with desktop sidebar + topbar + sticky footer; live-fetches `/api/dashboard/stats` every 30s to keep sidebar/footer fresh
- `src/components/dashboard/sidebar-content.tsx` — reusable sidebar nav (Overview, Projects, Templates, Assets, Favorites, Notifications, Support, Settings, Back to Home); shows plan badge + storage meter + free-trial CTA
- `src/components/dashboard/top-bar.tsx` — search (`/` shortcut), notifications bell with unread count, user menu dropdown (Profile/Settings/Logout), mobile Sheet menu
- `src/components/dashboard/plan-badge.tsx` — colored plan badge (FREE/STUDENT/PRO/TEAM)
- `src/components/dashboard/storage-meter.tsx` — progress bar with formatMb helper
- `src/components/dashboard/project-card.tsx` — project card with grid/list variants; actions: rename, duplicate, favorite toggle, archive, move-to-folder, delete (with confirm dialog)
- `src/components/dashboard/empty-state.tsx` — reusable empty-state component

### Dashboard Pages
- `src/app/dashboard/page.tsx` — Overview: 4 stat cards (Projects, Storage, Plan, Recent Activity), Quick Actions (5 type cards), Recent Projects grid, Activity-over-time area chart (recharts), Announcement widget, Create New Project CTA card
- `src/app/dashboard/projects/page.tsx` — Projects: folders sidebar (create/rename/delete), filter bar (search + type + status + favorites toggle + grid/list toggle), project cards with all actions. Uses Suspense for `useSearchParams`.
- `src/app/dashboard/templates/page.tsx` — Templates: browse DB templates, filter by category & premium, "Use Template" creates a project from it
- `src/app/dashboard/assets/page.tsx` — Assets: drag-drop upload zone + file picker, asset grid with type filter, download/delete actions, live storage meter
- `src/app/dashboard/favorites/page.tsx` — Favorites: shows favorited projects via `?favorite=true`
- `src/app/dashboard/notifications/page.tsx` — Notifications: grouped by type (system/subscription/security/announcement), mark-as-read + mark-all-read
- `src/app/dashboard/support/page.tsx` — Support: ticket list + detail view with reply thread + reply box + close ticket; New Ticket dialog (subject, category, priority, description)
- `src/app/dashboard/settings/page.tsx` — Settings: 6 tabs (Profile, Password, Notifications, Theme, Language, Account Management) with trial-start CTA, plan list, delete-account (visual)

### API Routes (all require auth via `getCurrentUser()`, ownership enforced)
- `GET /api/dashboard/stats` — overview numbers + 7-day activity series + latest announcement
- `GET|POST /api/projects` — list with filters (type/status/favorite/search/folderId) + create
- `PATCH|DELETE /api/projects/[id]` — rename/favorite/archive/move-folder + soft delete
- `POST /api/projects/[id]/duplicate` — duplicate project
- `GET|POST /api/folders` — list (with project counts) + create
- `PATCH|DELETE /api/folders/[id]` — rename + delete (detaches projects first)
- `GET|POST /api/assets` — list + multipart upload to `/public/uploads/[userId]/[filename]`; enforces storage limit; updates Profile.storageUsedMb
- `DELETE /api/assets/[id]` — soft delete + remove file from disk + decrement storage
- `GET /api/notifications` — list (optionally by type) + unread count
- `PATCH /api/notifications/[id]/read` — mark one as read
- `PATCH /api/notifications/read-all` — mark all as read
- `PATCH /api/settings/profile` — update fullName/username/bio/avatarUrl/location/website (username uniqueness enforced; syncs `User.name`)
- `PATCH /api/settings/password` — verify current, hash new (bcryptjs), log security event
- `PATCH /api/settings/preferences` — notifyEmail/notifyPush/notifySecurity/language/themePreference
- `POST /api/trial/start` — activate 30-day Pro trial: sets trialActive/trialStartedAt/trialEndsAt, upgrades storageLimitMb to 50GB, creates trialing Subscription, sends notification
- `GET|POST /api/support/tickets` — list + create (auto-generates TKT-XXXX)
- `GET|PATCH /api/support/tickets/[id]` — detail with replies + close (status: open/pending/resolved/closed)
- `POST /api/support/tickets/[id]/reply` — add user reply; reopens if ticket was closed
- `GET /api/templates` — list active templates with optional category/search filter
- `GET /api/me` — full profile data for the settings page

### Helpers
- `src/lib/dashboard/constants.ts` — project types, asset types, ticket categories/priorities, notification groups, languages; `formatBytes`, `formatMb`, `timeAgo`, `initials` helpers

## Key Decisions
- Used the dark professional theme (no custom CSS added) — reuses `bg-gradient-brand`, `bg-gradient-brand-soft`, `text-gradient` utilities from globals.css
- Server `dashboard/layout.tsx` calls `requireAuth()` from `@/lib/auth/session` (redirects to `/login` if unauthenticated) — defense in depth alongside `middleware.ts`
- All API routes enforce `userId` ownership filtering
- Used `@tanstack/react-query` for all client data fetching (already provided by `QueryProvider` in root layout)
- All mutations use sonner toasts for feedback (`toast.success/error/info`)
- Asset uploads written to disk via `fs/promises.mkdir` + `fs/promises.writeFile` at `public/uploads/[userId]/[filename]`; URL stored as `/uploads/[userId]/[filename]`
- Next.js 16 dynamic route params treated as Promise: `props: { params: Promise<{ id: string }> }` + `const { id } = await props.params`
- Wrapped `useSearchParams` consumers in `<Suspense>` to satisfy Next.js 16
- Settings tab uses `useEffect` to sync form state from `/api/me` query (avoids the "setState during render" lint error pattern seen in admin pages)
- Did NOT modify globals.css, root layout.tsx, providers, auth files, or the landing page (per instructions)
- All pages responsive (mobile-first with sm/md/lg/xl breakpoints); sidebar collapses to Sheet on mobile via `useIsMobile`-style sheet trigger
- Sticky footer via `flex min-h-screen flex-col` wrapper + `mt-auto` footer

## Lint Status
- 0 errors, 0 warnings in MY files (`src/app/dashboard/**`, `src/app/api/{dashboard,projects,folders,assets,notifications,settings,trial,support,templates,me}/**`, `src/components/dashboard/**`, `src/lib/dashboard/**`)
- Pre-existing lint errors in `src/app/admin/**` pages (different agent's work) are NOT touched

## Smoke Tests Performed
- Logged in as `creator@creativo.app` / `Demo@2024` — all `/dashboard/*` routes return 200
- All API endpoints return 200 with correct payload shape
- Tested mutations: create project, create folder, upload asset, create ticket, mark all notifications read, start trial, update profile, update preferences, change password (correct + incorrect current), use-template — all succeed
- Reset demo user's profile after testing ( fullName back to "Alex Creator", bio back to original ); demo password is `Demo@2024`
- Note: trial activation persists on the demo `creator@creativo.app` profile (`trialActive=true`) — re-running `bun run db:reset` or starting a fresh seed would clear it
