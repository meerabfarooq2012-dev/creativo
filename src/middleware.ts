import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Plain middleware (not withAuth) for route protection.
 *
 * We avoid next-auth's withAuth wrapper because its built-in redirect logic
 * can cause redirect loops in proxied/preview environments where cookie
 * domains differ. Instead we read the JWT ourselves and redirect explicitly.
 *
 * IMPORTANT for proxied/preview environments: we build redirect URLs from
 * req.nextUrl (which preserves the forwarded host) rather than req.url
 * (which can resolve to the internal localhost host and break cookies).
 */

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
  "/cookies",
];

const PUBLIC_EXACT = new Set([
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
]);

function isPublic(path: string): boolean {
  if (PUBLIC_EXACT.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

/** Build a redirect response that preserves the forwarded host + protocol. */
function redirectTo(req: NextRequest, pathname: string, search?: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ?? "";
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Always allow public routes (no auth check, no redirect)
  if (isPublic(path)) {
    return NextResponse.next();
  }

  // Read the JWT token from the cookie (works across proxy domains).
  // cookieName matches the custom name set in authOptions.cookies.sessionToken.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "creativo-session",
  });

  // Not authenticated → redirect to /login with callbackUrl
  if (!token) {
    const callback = path + req.nextUrl.search;
    const search = `callbackUrl=${encodeURIComponent(callback)}`;
    return redirectTo(req, "/login", search);
  }

  const role = (token.role as string | undefined) ?? "FREE_USER";

  // Admin area: only ADMIN + SUPER_ADMIN
  if (path.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return redirectTo(req, "/dashboard");
    }
  }

  // Banned/suspended users can't access app routes (only login/logout)
  const status = (token.status as string | undefined) ?? "active";
  if ((status === "banned" || status === "suspended") && !path.startsWith("/api/auth")) {
    return redirectTo(req, "/login", "error=AccountSuspended");
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets, uploads, and NextAuth API routes (so session
  // endpoints always return JSON, never get redirected).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|logo.svg|robots.txt|api/auth).*)",
  ],
};
