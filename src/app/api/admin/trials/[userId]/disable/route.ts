import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ userId: string }>;
}

export async function POST(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { userId } = await props.params;

  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await db.profile.update({
    where: { userId },
    data: { trialActive: false, trialEndsAt: new Date() },
  });

  await logAdminAction({
    adminId,
    action: "trial.disable",
    targetUserId: userId,
    targetEntity: "Profile",
    targetEntityId: userId,
    details: "Trial disabled by admin",
    ip: getIp(req),
  });

  return NextResponse.json({
    trialActive: updated.trialActive,
    trialEndsAt: updated.trialEndsAt ? updated.trialEndsAt.toISOString() : null,
  });
}
