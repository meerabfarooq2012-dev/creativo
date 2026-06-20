import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/permissions";
import { PLANS } from "@/lib/constants/plans";
import { randomBytes } from "crypto";

/**
 * Ensures default Plans + Roles exist in the database (idempotent).
 */
export async function ensureSeedData() {
  // Plans
  for (const plan of PLANS) {
    const existing = await db.plan.findUnique({ where: { name: plan.name } });
    if (!existing) {
      await db.plan.create({
        data: {
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          storageLimitMb: plan.storageLimitMb,
          features: JSON.stringify(plan.features),
          isPopular: plan.isPopular,
          sortOrder: PLANS.indexOf(plan),
          isActive: true,
        },
      });
    } else {
      await db.plan.update({
        where: { name: plan.name },
        data: {
          displayName: plan.displayName,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          storageLimitMb: plan.storageLimitMb,
          features: JSON.stringify(plan.features),
          isPopular: plan.isPopular,
          sortOrder: PLANS.indexOf(plan),
        },
      });
    }
  }

  // Roles
  const roleDefs = [
    { name: ROLES.FREE_USER, displayName: "Free User", description: "Basic access" },
    { name: ROLES.STUDENT, displayName: "Student", description: "Student plan" },
    { name: ROLES.PRO, displayName: "Pro", description: "Professional plan" },
    { name: ROLES.MODERATOR, displayName: "Moderator", description: "Content moderator" },
    { name: ROLES.ADMIN, displayName: "Admin", description: "Administrator" },
    { name: ROLES.SUPER_ADMIN, displayName: "Super Admin", description: "Full control" },
  ];
  for (const r of roleDefs) {
    const existing = await db.role.findUnique({ where: { name: r.name } });
    if (!existing) {
      await db.role.create({
        data: {
          name: r.name,
          displayName: r.displayName,
          description: r.description,
          isSystem: true,
        },
      });
    }
  }
}

/**
 * Ensures the super admin account exists. Used for admin dashboard access.
 */
export async function ensureSuperAdmin() {
  const email = "admin@creativo.app";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;

  const password = await hashPassword("Admin@2024");
  const user = await db.user.create({
    data: {
      email,
      name: "Creativo Admin",
      emailVerified: new Date(),
      password,
      status: "active",
      profile: {
        create: {
          fullName: "Creativo Admin",
          username: "admin",
          role: ROLES.SUPER_ADMIN,
          plan: "TEAM",
          storageLimitMb: 500000,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      },
      subscriptions: {
        create: {
          plan: "TEAM",
          status: "active",
        },
      },
    },
    include: { profile: true },
  });

  return user;
}

/**
 * Creates a password reset token for a user.
 */
export async function createPasswordResetToken(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.verificationToken.upsert({
    where: { token },
    update: { identifier: email, expires },
    create: { identifier: email, token, expires },
  });

  return { token, user };
}

export async function verifyResetToken(token: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expires < new Date()) return null;
  return record;
}
