import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { status, plan, endsAt, interval } = body as {
    status?: string;
    plan?: string;
    endsAt?: string | null;
    interval?: string;
  };

  const existing = await db.subscription.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const data: any = {};
  if (status) data.status = status;
  if (plan) data.plan = plan;
  if (interval) data.interval = interval;
  if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;

  const sub = await db.subscription.update({ where: { id }, data });

  await logAdminAction({
    adminId,
    action: "subscription.update",
    targetEntity: "Subscription",
    targetEntityId: id,
    details: JSON.stringify(data),
    ip: getIp(req),
  });

  return NextResponse.json({
    subscription: {
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      startedAt: sub.startedAt.toISOString(),
      endsAt: sub.endsAt ? sub.endsAt.toISOString() : null,
      trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.toISOString() : null,
      amount: sub.amount,
      currency: sub.currency,
      interval: sub.interval,
    },
  });
}
