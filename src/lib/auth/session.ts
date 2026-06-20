import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasPermission, isAdmin } from "@/lib/permissions";

export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Returns the current user session or null (does not redirect).
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  return {
    session,
    user,
    profile: user?.profile,
  };
}

/**
 * Require authentication. Redirects to /login if not signed in.
 */
export async function requireAuth() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    redirect("/login");
  }
  return ctx;
}

/**
 * Require a specific permission. Redirects to /dashboard if not authorized.
 */
export async function requirePermission(permission: string) {
  const ctx = await requireAuth();
  const role = ctx.profile?.role ?? ctx.session.user.role;
  if (!hasPermission(role, permission)) {
    redirect("/dashboard");
  }
  return ctx;
}

/**
 * Require admin role. Redirects to /dashboard if not admin.
 */
export async function requireAdmin() {
  const ctx = await requireAuth();
  const role = ctx.profile?.role ?? ctx.session.user.role;
  if (!isAdmin(role)) {
    redirect("/dashboard");
  }
  return ctx;
}

/**
 * Require a minimum role level (does not redirect, returns boolean).
 */
export async function checkRole(minRole: string) {
  const ctx = await getCurrentUser();
  if (!ctx) return false;
  const role = ctx.profile?.role ?? ctx.session?.user?.role;
  if (!role) return false;
  const levels: Record<string, number> = {
    FREE_USER: 10,
    STUDENT: 20,
    PRO: 30,
    MODERATOR: 70,
    ADMIN: 90,
    SUPER_ADMIN: 100,
  };
  return (levels[role] ?? 0) >= (levels[minRole] ?? 0);
}
