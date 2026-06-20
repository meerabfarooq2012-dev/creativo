import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const where: any = { userId };
  if (type && type !== "all") where.type = type;

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = await db.notification.count({ where: { userId, isRead: false } });

  return NextResponse.json({ notifications, unreadCount });
}
