import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Protect admin area
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protect dashboard area (must be authenticated - handled by withAuth)
    // Allow all authenticated users
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Always-public technical routes (SEO + assets)
        if (
          path === "/sitemap.xml" ||
          path === "/robots.txt" ||
          path === "/manifest.webmanifest"
        ) {
          return true;
        }
        // Public marketing/legal routes
        if (
          path === "/" ||
          path.startsWith("/login") ||
          path.startsWith("/signup") ||
          path.startsWith("/forgot-password") ||
          path.startsWith("/reset-password") ||
          path.startsWith("/verify") ||
          path.startsWith("/pricing") ||
          path.startsWith("/privacy") ||
          path.startsWith("/terms") ||
          path.startsWith("/security") ||
          path.startsWith("/cookies") ||
          path.startsWith("/api/auth")
        ) {
          return true;
        }
        // Everything else requires a token
        return !!token;
      },
    },
  }
);

export const config = {
  // Exclude NextAuth API routes so the middleware (withAuth) never intercepts
  // them — this prevents the session endpoint from returning HTML/redirects
  // instead of JSON (fixes [next-auth][error][CLIENT_FETCH_ERROR]).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|logo.svg|robots.txt|api/auth).*)",
  ],
};
