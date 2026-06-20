import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  await requireAdmin();
  const profiles = await db.profile.findMany({
    where: { trialActive: true },
    include: { user: { select: { id: true, name: true, email: true, status: true } } },
    orderBy: { trialEndsAt: "asc" },
  });

  return NextResponse.json({
    trials: profiles.map((p) => ({
      userId: p.userId,
      trialActive: p.trialActive,
      trialStartedAt: p.trialStartedAt ? p.trialStartedAt.toISOString() : null,
      trialEndsAt: p.trialEndsAt ? p.trialEndsAt.toISOString() : null,
      plan: p.plan,
      user: p.user,
    })),
  });
}
