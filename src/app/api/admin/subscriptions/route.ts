import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const plan = searchParams.get("plan") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "20")));

  const where: any = {};
  if (status) where.status = status;
  if (plan) where.plan = plan;

  const [total, subscriptions] = await Promise.all([
    db.subscription.count({ where }),
    db.subscription.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const stats = {
    total: await db.subscription.count(),
    active: await db.subscription.count({ where: { status: "active" } }),
    trialing: await db.subscription.count({ where: { status: "trialing" } }),
    canceled: await db.subscription.count({ where: { status: "canceled" } }),
    mrr: await db.subscription.aggregate({
      _sum: { amount: true },
      where: { status: "active", interval: "monthly" },
    }),
  };

  return NextResponse.json({
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      startedAt: s.startedAt.toISOString(),
      endsAt: s.endsAt ? s.endsAt.toISOString() : null,
      trialEndsAt: s.trialEndsAt ? s.trialEndsAt.toISOString() : null,
      amount: s.amount,
      currency: s.currency,
      interval: s.interval,
      user: s.user,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    stats: {
      ...stats,
      mrr: stats.mrr._sum.amount ?? 0,
    },
  });
}
