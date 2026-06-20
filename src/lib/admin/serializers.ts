import { Prisma } from "@prisma/client";

export type UserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;

export function serializeUser(u: UserWithProfile) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    status: u.status,
    bannedReason: u.bannedReason,
    bannedAt: u.bannedAt ? u.bannedAt.toISOString() : null,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    role: u.profile?.role ?? "FREE_USER",
    plan: u.profile?.plan ?? "FREE",
    storageUsedMb: u.profile?.storageUsedMb ?? 0,
    storageLimitMb: u.profile?.storageLimitMb ?? 500,
    trialActive: u.profile?.trialActive ?? false,
    trialEndsAt: u.profile?.trialEndsAt ? u.profile.trialEndsAt.toISOString() : null,
  };
}

export function planStorageLimit(plan: string): number {
  switch (plan) {
    case "TEAM":
      return 500000;
    case "PRO":
      return 50000;
    case "STUDENT":
      return 5000;
    default:
      return 500;
  }
}
