import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  const [projectCount, activeProjects, archivedProjects, favoriteCount, folderCount, assetCount, unreadNotifications, latestActivity, announcement] = await Promise.all([
    db.project.count({ where: { userId, isDeleted: false } }),
    db.project.count({ where: { userId, isDeleted: false, status: "active" } }),
    db.project.count({ where: { userId, isDeleted: false, status: "archived" } }),
    db.project.count({ where: { userId, isDeleted: false, isFavorite: true } }),
    db.folder.count({ where: { userId } }),
    db.asset.count({ where: { userId, isDeleted: false } }),
    db.notification.count({ where: { userId, isRead: false } }),
    db.activityLog.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.announcement.findFirst({
      where: { isPublished: true },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    }),
  ]);

  // Activity over last 7 days (count activities per day)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentLogs = await db.activityLog.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, category: true },
  });

  const dayMap: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayMap.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    });
  }
  for (const log of recentLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.find((d) => d.date === key);
    if (entry) entry.count += 1;
  }

  return NextResponse.json({
    projects: projectCount,
    activeProjects,
    archivedProjects,
    favoriteProjects: favoriteCount,
    folders: folderCount,
    assets: assetCount,
    unreadNotifications,
    storage: {
      usedMb: ctx.profile?.storageUsedMb ?? 0,
      limitMb: ctx.profile?.storageLimitMb ?? 500,
      percent: Math.min(
        100,
        ((ctx.profile?.storageUsedMb ?? 0) / (ctx.profile?.storageLimitMb ?? 500)) * 100
      ),
    },
    plan: ctx.profile?.plan ?? "FREE",
    trialActive: ctx.profile?.trialActive ?? false,
    trialEndsAt: ctx.profile?.trialEndsAt ?? null,
    latestActivity: latestActivity
      ? {
          action: latestActivity.action,
          entity: latestActivity.entity,
          createdAt: latestActivity.createdAt,
        }
      : null,
    announcement: announcement
      ? {
          id: announcement.id,
          title: announcement.title,
          summary: announcement.summary,
          content: announcement.content,
          type: announcement.type,
          publishedAt: announcement.publishedAt,
          isPinned: announcement.isPinned,
        }
      : null,
    activitySeries: dayMap,
  });
}
