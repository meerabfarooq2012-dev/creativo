import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeUser } from "@/lib/admin/serializers";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await db.user.update({
    where: { id },
    data: { status: "active", bannedReason: null, bannedAt: null },
    include: { profile: true },
  });

  await db.securityLog.create({
    data: { userId: id, event: "login_success", metadata: JSON.stringify({ unblocked: true, adminId }) },
  });

  await logAdminAction({
    adminId,
    action: "user.unban",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: "Account reactivated",
    ip: getIp(req),
  });

  return NextResponse.json({ user: serializeUser(updated) });
}
