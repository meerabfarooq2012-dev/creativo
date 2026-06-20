import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = ctx.profile;
  return NextResponse.json({
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
    image: ctx.user.image,
    fullName: profile?.fullName ?? null,
    username: profile?.username ?? null,
    bio: profile?.bio ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    location: profile?.location ?? null,
    website: profile?.website ?? null,
    role: profile?.role ?? "FREE_USER",
    plan: profile?.plan ?? "FREE",
    storageLimitMb: profile?.storageLimitMb ?? 500,
    storageUsedMb: profile?.storageUsedMb ?? 0,
    trialActive: profile?.trialActive ?? false,
    trialStartedAt: profile?.trialStartedAt ?? null,
    trialEndsAt: profile?.trialEndsAt ?? null,
    emailVerified: profile?.emailVerified ?? false,
    language: profile?.language ?? "en",
    themePreference: profile?.themePreference ?? "dark",
    notifyEmail: profile?.notifyEmail ?? true,
    notifyPush: profile?.notifyPush ?? true,
    notifySecurity: profile?.notifySecurity ?? true,
  });
}
