import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/badges";
import { Server, Database, ShieldCheck, Cpu, HardDrive, Clock } from "lucide-react";

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const ctx = await requireAdmin();
  const user = ctx.user!;
  const profile = ctx.profile;
  const role = profile?.role ?? ctx.session.user.role;

  const counts = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.asset.count(),
    db.plan.count(),
    db.supportTicket.count(),
    db.announcement.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Settings"
        description="System information and your admin profile."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Admin Profile</h2>
            <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300">
              <ShieldCheck className="size-3 mr-1" /> Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-gradient-brand text-white text-xl">
                {(user.name || user.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-foreground">{user.name || "Unnamed"}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <RoleBadge role={role} />
                <Badge variant="outline" className="capitalize">{profile?.plan ?? "FREE"}</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last login</p>
              <p className="text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p className="text-foreground font-mono text-xs truncate">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-300 capitalize">{user.status}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">System Information</h2>
            <p className="text-xs text-muted-foreground">Platform statistics and runtime metadata</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat icon={Server} label="Environment" value={process.env.NODE_ENV || "development"} />
            <Stat icon={Database} label="Database" value="SQLite (Prisma)" />
            <Stat icon={Cpu} label="Framework" value="Next.js 16 (App Router)" />
            <Stat icon={HardDrive} label="Storage" value="/public/uploads" />
            <Stat icon={Clock} label="Server time" value={new Date().toLocaleString()} />
            <Stat icon={ShieldCheck} label="Auth" value="NextAuth v4 (JWT)" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">Platform Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Users", value: counts[0] },
            { label: "Projects", value: counts[1] },
            { label: "Assets", value: counts[2] },
            { label: "Plans", value: counts[3] },
            { label: "Tickets", value: counts[4] },
            { label: "Announcements", value: counts[5] },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
