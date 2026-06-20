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
  const body = await req.json().catch(() => ({}));
  const days = Number(body.days) || 7;

  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const base = profile.trialEndsAt && profile.trialEndsAt > new Date() ? profile.trialEndsAt : new Date();
  const newEnd = new Date(base.getTime() + days * 86400000);

  const updated = await db.profile.update({
    where: { userId },
    data: { trialActive: true, trialEndsAt: newEnd, trialStartedAt: profile.trialStartedAt ?? new Date() },
  });

  await logAdminAction({
    adminId,
    action: "trial.extend",
    targetUserId: userId,
    targetEntity: "Profile",
    targetEntityId: userId,
    details: JSON.stringify({ days, newEnd: newEnd.toISOString() }),
    ip: getIp(req),
  });

  return NextResponse.json({
    trialActive: updated.trialActive,
    trialStartedAt: updated.trialStartedAt ? updated.trialStartedAt.toISOString() : null,
    trialEndsAt: updated.trialEndsAt ? updated.trialEndsAt.toISOString() : null,
  });
}
