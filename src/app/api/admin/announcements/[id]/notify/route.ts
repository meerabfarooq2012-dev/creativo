import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  if (!announcement.isPublished) {
    return NextResponse.json({ error: "Announcement must be published before notifying" }, { status: 400 });
  }

  // Determine audience filter
  let where: any = {};
  if (announcement.audience === "free") {
    where = { profile: { plan: "FREE" } };
  } else if (announcement.audience === "pro") {
    where = { profile: { plan: { in: ["PRO", "TEAM"] } } };
  } else if (announcement.audience === "admin") {
    where = { profile: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } };
  }

  const users = await db.user.findMany({ where, select: { id: true } });

  await db.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "announcement",
      title: announcement.title,
      message: announcement.summary || announcement.content.slice(0, 180),
      link: "/dashboard",
      metadata: JSON.stringify({ announcementId: announcement.id, type: announcement.type }),
    })),
  });

  await logAdminAction({
    adminId,
    action: "announcement.notify",
    targetEntity: "Announcement",
    targetEntityId: id,
    details: JSON.stringify({ audience: announcement.audience, recipients: users.length }),
    ip: getIp(req),
  });

  return NextResponse.json({ recipients: users.length });
}
