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

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if ((existing.profile?.role ?? "FREE_USER") === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot unblock a Super Admin" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data: { status: "active", bannedReason: null, bannedAt: null },
  });

  await db.securityLog.create({
    data: { userId: id, event: "login_success", metadata: JSON.stringify({ unblocked: true, adminId }) },
  });

  await logAdminAction({
    adminId,
    action: "security.unblock",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: "Account unblocked",
    ip: getIp(req),
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      status: updated.status,
    },
  });
}
