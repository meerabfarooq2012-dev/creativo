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
  const body = await req.json().catch(() => ({}));
  const reason = (body.reason as string)?.trim() || "Banned by admin";

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if ((existing.profile?.role ?? "FREE_USER") === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot ban a Super Admin" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data: { status: "banned", bannedReason: reason, bannedAt: new Date() },
    include: { profile: true },
  });

  await db.securityLog.create({
    data: { userId: id, event: "ban", metadata: JSON.stringify({ reason, adminId }) },
  });

  await logAdminAction({
    adminId,
    action: "user.ban",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: JSON.stringify({ reason }),
    ip: getIp(req),
  });

  return NextResponse.json({ user: serializeUser(updated) });
}
