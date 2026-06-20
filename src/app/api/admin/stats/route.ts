import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 86400000);

  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalProjects,
    storageAgg,
    activeSubs,
    openTickets,
    totalRevenueAgg,
    allUsers,
    projectsByTypeAgg,
    recentActivity,
    recentSignups,
    totalBeforeWindow,
    planAgg,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.project.count({ where: { isDeleted: false } }),
    db.profile.aggregate({ _sum: { storageUsedMb: true } }),
    db.subscription.count({ where: { status: "active" } }),
    db.supportTicket.count({ where: { status: { in: ["open", "pending"] } } }),
    db.subscription.aggregate({
      _sum: { amount: true },
      where: { status: "active", amount: { gt: 0 } },
    }),
    db.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.project.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: { isDeleted: false },
    }),
    db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { profile: { select: { role: true, plan: true } } },
    }),
    db.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
    db.profile.groupBy({ by: ["plan"], _count: { _all: true } }),
  ]);

  // Build user growth (30 days, cumulative) + new users per day
  const byDay: Record<string, number> = {};
  for (const u of allUsers) {
    const k = dayKey(u.createdAt);
    byDay[k] = (byDay[k] || 0) + 1;
  }
  const userGrowth: Array<{ date: string; total: number; new: number }> = [];
  let running = totalBeforeWindow;
  for (let i = 29; i >= 0; i--) {
    const d = startOfDay(new Date(now.getTime() - i * 86400000));
    const k = dayKey(d);
    const newToday = byDay[k] || 0;
    running += newToday;
    userGrowth.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: running,
      new: newToday,
    });
  }

  const newUsersDaily = userGrowth.slice(-14).map((g) => ({ date: g.date, count: g.new }));

  const planDistribution = ["FREE", "STUDENT", "PRO", "TEAM"].map((plan) => ({
    plan,
    count: planAgg.find((p) => p.plan === plan)?._count._all ?? 0,
  }));

  const projectsByType = projectsByTypeAgg.map((p) => ({ type: p.type, count: p._count._all }));

  return NextResponse.json({
    totalUsers,
    activeUsers,
    newUsers,
    totalProjects,
    storageUsedMb: storageAgg._sum.storageUsedMb ?? 0,
    activeSubscriptions: activeSubs,
    totalRevenue: totalRevenueAgg._sum.amount ?? 0,
    openTickets,
    userGrowth,
    newUsersDaily,
    planDistribution,
    projectsByType,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      category: a.category,
      createdAt: a.createdAt.toISOString(),
      user: a.user ? { name: a.user.name, email: a.user.email } : null,
    })),
    recentSignups: recentSignups.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      role: u.profile?.role ?? "FREE_USER",
      plan: u.profile?.plan ?? "FREE",
    })),
  });
}
