# Task 4-a: Auth Pages Builder

## Files Created
- `src/components/auth/auth-layout.tsx` — shared two-column auth layout
- `src/components/auth/password-strength.tsx` — reusable password strength meter
- `src/app/login/page.tsx` — login page (credentials, demo hints, role-aware redirect)
- `src/app/signup/page.tsx` — signup page (validates against API, auto sign-in after register)
- `src/app/forgot-password/page.tsx` — forgot password (displays devResetUrl in dev mode)
- `src/app/reset-password/page.tsx` — reset password (token-aware, success/invalid states)
- `src/app/verify-request/page.tsx` — informational "check your email" page

## Key Decisions
- Used `react-hook-form` + `zod` for all form validation
- Wrapped pages using `useSearchParams()` (login, reset-password) in `React.Suspense` to satisfy Next.js 16 App Router static-rendering requirements
- Login uses `signIn("credentials", { redirect: false })` and then fetches `/api/auth/session` to read `role` for role-aware redirect (`/admin` for ADMIN/SUPER_ADMIN, else `/dashboard` or callbackUrl)
- Signup calls `POST /api/auth/register` then `signIn("credentials", ...)` to auto-login the new user
- All error/success feedback via `sonner` toasts (already configured in root layout)
- Used framer-motion for subtle entrance animations on cards and success icons
- Brand showcase panel hidden on mobile (lg+ only); mobile shows compact logo header with back-to-home link instead

## Verified
- `bun run lint` passes clean
- All 5 routes return HTTP 200
- Login flow end-to-end: admin@creativo.app / Admin@2024 → 200 + session with `role: SUPER_ADMIN`
- Forgot-password returns `devResetUrl` in dev mode

## Pending dependencies (for later tasks)
- `/dashboard` route needs to be built (login & signup redirect there)
- `/admin` route needs to be built (admin login redirects there)
- `/terms` and `/privacy` routes referenced by signup — should be built or links removed
