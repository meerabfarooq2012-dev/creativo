import { requireAuth } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // requireAuth() redirects to /login if not authenticated (throws NEXT_REDIRECT)
  const ctx = await requireAuth();

  const user = {
    name: ctx.user.name ?? ctx.profile?.fullName ?? null,
    email: ctx.user.email ?? null,
    image: ctx.user.image ?? ctx.profile?.avatarUrl ?? null,
  };

  return (
    <DashboardShell
      user={user}
      initialPlan={ctx.profile?.plan ?? "FREE"}
      initialStorageUsedMb={ctx.profile?.storageUsedMb ?? 0}
      initialStorageLimitMb={ctx.profile?.storageLimitMb ?? 500}
      initialUnreadNotifications={0}
    >
      {children}
    </DashboardShell>
  );
}
