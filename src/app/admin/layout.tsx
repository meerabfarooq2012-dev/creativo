import { requireAdmin } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Console — Creativo",
  description: "Creativo administrator dashboard",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  const user = ctx.user!;
  const role = ctx.profile?.role ?? ctx.session.user.role;

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? ctx.profile?.avatarUrl,
        role,
      }}
    >
      {children}
    </AdminShell>
  );
}
