import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  const profile = ctx.profile;
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.trialActive) {
    return NextResponse.json(
      { error: "Trial is already active", trialEndsAt: profile.trialEndsAt },
      { status: 409 }
    );
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  // Activate trial and upgrade to Pro storage limit
  const updated = await db.profile.update({
    where: { userId },
    data: {
      trialActive: true,
      trialStartedAt: now,
      trialEndsAt: endsAt,
      storageLimitMb: 50000, // Pro storage
    },
  });

  // Create or update active subscription to "trialing"
  await db.subscription.create({
    data: {
      userId,
      plan: "PRO",
      status: "trialing",
      trialEndsAt: endsAt,
      interval: "monthly",
      amount: 12,
      currency: "USD",
    },
  });

  await db.notification.create({
    data: {
      userId,
      type: "subscription",
      title: "Free trial activated",
      message: `Your 30-day Pro trial is active until ${endsAt.toLocaleDateString()}. Enjoy 50 GB storage!`,
      isRead: false,
    },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "trial.start",
      category: "billing",
      entity: "profile",
      entityId: userId,
      metadata: JSON.stringify({ endsAt }),
    },
  });

  return NextResponse.json({
    success: true,
    trialActive: true,
    trialStartedAt: now,
    trialEndsAt: endsAt,
    storageLimitMb: updated.storageLimitMb,
  });
}
