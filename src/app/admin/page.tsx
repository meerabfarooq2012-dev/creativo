"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserCheck,
  UserPlus,
  FolderKanban,
  HardDrive,
  CreditCard,
  Activity,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { RoleBadge, PlanBadge } from "@/components/admin/badges";
import { adminFetch } from "@/lib/admin/api-client";
import type { AdminStats } from "@/lib/admin/types";
import { fmtMb, fmtCurrency, fmtNumber, fmtRelative } from "@/lib/admin/format";

const PLAN_COLORS: Record<string, string> = {
  FREE: "#64748B",
  STUDENT: "#38BDF8",
  PRO: "#7C3AED",
  TEAM: "#22C55E",
};

const TYPE_COLORS: Record<string, string> = {
  design: "#7C3AED",
  illustration: "#3B82F6",
  photo: "#22C55E",
  video: "#F59E0B",
  animation: "#EF4444",
};

function initials(name: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-5 ${className || ""}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

function StatSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block size-2 rounded-full mr-1.5 align-middle" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-medium text-foreground">{fmtNumber(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch<AdminStats>("/api/admin/stats"),
    refetchInterval: 60000,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Platform health, growth, and recent activity at a glance."
        actions={
          <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300">
            <Activity className="size-3 mr-1" />
            Live
          </Badge>
        }
      />

      {isLoading ? (
        <StatSkeletons />
      ) : isError ? (
        <Card className="p-6 text-sm text-muted-foreground">Failed to load stats. Please retry.</Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Users" value={fmtNumber(data.totalUsers)} icon={Users} accent="primary" />
            <StatCard label="Active (7d)" value={fmtNumber(data.activeUsers)} icon={UserCheck} accent="success" hint="logged in this week" />
            <StatCard label="New Users (7d)" value={fmtNumber(data.newUsers)} icon={UserPlus} accent="secondary" />
            <StatCard label="Total Projects" value={fmtNumber(data.totalProjects)} icon={FolderKanban} accent="primary" />
            <StatCard label="Storage Used" value={fmtMb(data.storageUsedMb)} icon={HardDrive} accent="warning" hint="across all users" />
            <StatCard label="Active Subscriptions" value={fmtNumber(data.activeSubscriptions)} icon={CreditCard} accent="success" hint={`${fmtCurrency(data.totalRevenue)} MRR`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="User Growth" subtitle="Total users over the last 30 days" className="lg:col-span-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#334155" }} interval={4} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="total" name="Total users" stroke="#7C3AED" strokeWidth={2} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Plan Distribution" subtitle="Users by subscription plan">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.planDistribution}
                      dataKey="count"
                      nameKey="plan"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {data.planDistribution.map((entry) => (
                        <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan] || "#64748B"} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Legend
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="New Users per Day" subtitle="Last 14 days" className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.newUsersDaily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#334155" }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="New users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Projects by Type" subtitle="Active projects">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.projectsByType} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="type" tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Projects" radius={[0, 4, 4, 0]}>
                      {data.projectsByType.map((entry) => (
                        <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || "#7C3AED"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest platform events</p>
                </div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              {data.recentActivity.length === 0 ? (
                <EmptyState icon={Inbox} title="No recent activity" />
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {data.recentActivity.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-violet-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">
                          <span className="font-medium">{a.action}</span>
                          <span className="text-muted-foreground"> · {a.category}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.user?.name || a.user?.email || "system"} · {fmtRelative(a.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Signups</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest 5 new users</p>
                </div>
                <UserPlus className="size-4 text-muted-foreground" />
              </div>
              {data.recentSignups.length === 0 ? (
                <EmptyState icon={Inbox} title="No signups yet" />
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {data.recentSignups.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/40">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-gradient-brand text-white text-xs">{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{u.name || u.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <RoleBadge role={u.role} />
                        <span className="text-[10px] text-muted-foreground">{fmtRelative(u.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading dashboard…
        </div>
      )}
    </div>
  );
}
