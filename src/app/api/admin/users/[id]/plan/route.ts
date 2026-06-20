import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeUser, planStorageLimit } from "@/lib/admin/serializers";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const plan = (body.plan as string)?.toUpperCase();
  const interval = (body.interval as string) || "monthly";

  if (!["FREE", "STUDENT", "PRO", "TEAM"].includes(plan || "")) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const planRecord = await db.plan.findUnique({ where: { name: plan } });
  const amount = plan === "FREE" ? 0 : (interval === "yearly" ? (planRecord?.priceYearly ?? 0) : (planRecord?.priceMonthly ?? 0));

  const updated = await db.user.update({
    where: { id },
    data: {
      profile: {
        update: {
          plan,
          storageLimitMb: planStorageLimit(plan),
        },
      },
      subscriptions: {
        create: {
          plan,
          status: "active",
          amount,
          interval,
          startedAt: new Date(),
        },
      },
    },
    include: { profile: true },
  });

  await logAdminAction({
    adminId,
    action: "user.change_plan",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: JSON.stringify({ plan, interval }),
    ip: getIp(req),
  });

  return NextResponse.json({ user: serializeUser(updated) });
}
