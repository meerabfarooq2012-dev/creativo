"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  HardDrive,
  CreditCard,
  Activity,
  Plus,
  PenTool,
  Brush,
  Image as ImageIcon,
  Video,
  Sparkles,
  Megaphone,
  ArrowRight,
  Pin,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PlanBadge } from "@/components/dashboard/plan-badge";
import { StorageMeter } from "@/components/dashboard/storage-meter";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatMb, timeAgo } from "@/lib/dashboard/constants";
import { PROJECT_TYPES } from "@/lib/dashboard/constants";

const QUICK_ACTIONS = [
  { type: "design", label: "New Design", icon: PenTool, color: "#7C3AED" },
  { type: "illustration", label: "New Illustration", icon: Brush, color: "#3B82F6" },
  { type: "photo", label: "New Photo Edit", icon: ImageIcon, color: "#22C55E" },
  { type: "video", label: "New Video Edit", icon: Video, color: "#F59E0B" },
  { type: "animation", label: "New Animation", icon: Sparkles, color: "#EC4899" },
] as const;

const chartConfig = {
  count: { label: "Activity", color: "#7C3AED" },
} satisfies ChartConfig;

export default function DashboardOverviewPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [creating, setCreating] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/projects?status=active");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const recentProjects = (projectsData?.projects ?? []).slice(0, 6);

  const onQuickAction = async (type: string, label: string) => {
    setCreating(type);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Untitled ${label.replace("New ", "")}`, type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      const { project } = await res.json();
      toast.success(`${label} created`, {
        description: "Editor coming soon — project saved to your workspace.",
      });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/dashboard/projects");
      return project;
    } catch (e: any) {
      toast.error(e.message ?? "Could not create project");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your creative workspace today.
          </p>
        </div>
        <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
          <a href="/dashboard/projects">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </a>
        </Button>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          icon={FolderKanban}
          label="Projects"
          value={statsLoading ? null : String(stats?.projects ?? 0)}
          hint={`${stats?.activeProjects ?? 0} active · ${stats?.archivedProjects ?? 0} archived`}
          color="#7C3AED"
          loading={statsLoading}
        />
        <OverviewCard
          icon={HardDrive}
          label="Storage Used"
          value={statsLoading ? null : formatMb(stats?.storage?.usedMb ?? 0)}
          hint={`${stats?.storage?.percent?.toFixed(0) ?? 0}% of ${formatMb(stats?.storage?.limitMb ?? 0)}`}
          color="#3B82F6"
          loading={statsLoading}
          footer={
            stats && (
              <StorageMeter
                usedMb={stats.storage.usedMb}
                limitMb={stats.storage.limitMb}
                compact
              />
            )
          }
        />
        <OverviewCard
          icon={CreditCard}
          label="Active Plan"
          value={statsLoading ? null : <PlanBadge plan={stats?.plan ?? "FREE"} />}
          hint={
            stats?.trialActive
              ? `Trial · ends ${new Date(stats.trialEndsAt).toLocaleDateString()}`
              : stats?.plan === "FREE"
              ? "Upgrade for more storage"
              : "Subscription active"
          }
          color="#22C55E"
          loading={statsLoading}
        />
        <OverviewCard
          icon={Activity}
          label="Recent Activity"
          value={
            statsLoading
              ? null
              : stats?.latestActivity
              ? stats.latestActivity.action.replace(/\./g, " ")
              : "No activity yet"
          }
          hint={stats?.latestActivity ? timeAgo(stats.latestActivity.createdAt) : "—"}
          color="#F59E0B"
          loading={statsLoading}
          smallValue
        />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.type}
                disabled={creating === a.type}
                onClick={() => onQuickAction(a.type, a.label)}
                className="group relative flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg disabled:opacity-60"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${a.color}20`, color: a.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">Click to create</p>
                </div>
                {creating === a.type && (
                  <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/projects">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
          {projectsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first design, illustration, or photo edit to get started."
              action={
                <Button asChild className="bg-gradient-brand">
                  <a href="/dashboard/projects">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </a>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentProjects.map((p: any) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>

        {/* Right column: Activity chart + Announcement */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity over time</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="h-32 w-full">
                  <AreaChart data={stats?.activitySeries ?? []} margin={{ left: -20, right: 6, top: 6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                      allowDecimals={false}
                      width={28}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      fill="url(#activityGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Announcement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : stats?.announcement ? (
                <div>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-tight">
                      {stats.announcement.title}
                    </h3>
                    {stats.announcement.isPinned && (
                      <Pin className="h-3.5 w-3.5 shrink-0 text-warning" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.announcement.summary ?? stats.announcement.content?.slice(0, 120)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {stats.announcement.type}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(stats.announcement.publishedAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create CTA */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-brand-soft">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Create New Project</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a fresh design, illustration, photo edit, video, or animation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPES.map((t) => (
              <Button
                key={t.value}
                variant="outline"
                size="sm"
                onClick={() => onQuickAction(t.value, `New ${t.label}`)}
                disabled={creating === t.value}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  hint,
  color,
  loading,
  footer,
  smallValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint?: string;
  color: string;
  loading?: boolean;
  footer?: React.ReactNode;
  smallValue?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className={smallValue ? "text-sm font-semibold capitalize" : "text-2xl font-bold"}>
            {value}
          </div>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
}
