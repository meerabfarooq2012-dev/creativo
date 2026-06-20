import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "30")));

  const secWhere: any = {};
  if (event) secWhere.event = event;
  const actWhere: any = {};
  if (category) actWhere.category = category;

  const [secTotal, securityLogs, actTotal, activityLogs] = await Promise.all([
    db.securityLog.count({ where: secWhere }),
    db.securityLog.findMany({
      where: secWhere,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.activityLog.count({ where: actWhere }),
    db.activityLog.findMany({
      where: actWhere,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const eventTypes = await db.securityLog.groupBy({
    by: ["event"],
    _count: { _all: true },
    orderBy: { _count: { _all: "desc" } },
  });

  return NextResponse.json({
    securityLogs: securityLogs.map((s) => ({
      id: s.id,
      event: s.event,
      ip: s.ip,
      location: s.location,
      createdAt: s.createdAt.toISOString(),
      user: s.user,
    })),
    securityTotal: secTotal,
    activityLogs: activityLogs.map((a) => ({
      id: a.id,
      action: a.action,
      category: a.category,
      entity: a.entity,
      entityId: a.entityId,
      ip: a.ip,
      createdAt: a.createdAt.toISOString(),
      user: a.user,
    })),
    activityTotal: actTotal,
    eventTypes: eventTypes.map((e) => ({ event: e.event, count: e._count._all })),
    page,
    pageSize,
  });
}
