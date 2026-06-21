import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

/**
 * POST /api/setup
 * GET  /api/setup
 *
 * Sets correct bcrypt password hashes for all demo users.
 * Call this once after the database tables + placeholder users are created.
 */
async function handleSetup() {
  const results: string[] = [];

  // Demo users with their passwords
  const demoUsers = [
    { id: "user_admin", email: "admin@creativo.app", password: "Admin@2024" },
    { id: "user_creator", email: "creator@creativo.app", password: "Demo@2024" },
    { id: "user_student", email: "student@creativo.app", password: "Demo@2024" },
    { id: "user_free", email: "free@creativo.app", password: "Demo@2024" },
    { id: "user_mod", email: "mod@creativo.app", password: "Demo@2024" },
  ];

  for (const u of demoUsers) {
    const existing = await db.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      // Create user if missing
      const hashed = await hashPassword(u.password);
      await db.user.create({
        data: {
          id: u.id,
          email: u.email,
          name: u.email.split("@")[0],
          password: hashed,
          emailVerified: new Date(),
          status: "active",
        },
      });
      results.push(`Created ${u.email}`);
    } else if (!existing.password || existing.password === "PLACEHOLDER") {
      // Update password if placeholder
      const hashed = await hashPassword(u.password);
      await db.user.update({
        where: { id: existing.id },
        data: { password: hashed },
      });
      results.push(`Updated password for ${u.email}`);
    } else {
      results.push(`OK ${u.email} (already has password)`);
    }
  }

  // Ensure profiles exist
  const profiles = [
    { userId: "user_admin", fullName: "Creativo Admin", username: "admin", role: "SUPER_ADMIN", plan: "TEAM", storageLimitMb: 500000 },
    { userId: "user_creator", fullName: "Alex Creator", username: "creator", role: "PRO", plan: "PRO", storageLimitMb: 50000 },
    { userId: "user_student", fullName: "Jamie Student", username: "student", role: "STUDENT", plan: "STUDENT", storageLimitMb: 5000 },
    { userId: "user_free", fullName: "Sam Free", username: "free", role: "FREE_USER", plan: "FREE", storageLimitMb: 500 },
    { userId: "user_mod", fullName: "Morgan Mod", username: "mod", role: "MODERATOR", plan: "PRO", storageLimitMb: 50000 },
  ];

  for (const p of profiles) {
    const existing = await db.profile.findUnique({ where: { userId: p.userId } });
    if (!existing) {
      await db.profile.create({
        data: {
          userId: p.userId,
          fullName: p.fullName,
          username: p.username,
          role: p.role,
          plan: p.plan,
          storageLimitMb: p.storageLimitMb,
          storageUsedMb: 0,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      results.push(`Created profile for ${p.username}`);
    }
  }

  const userCount = await db.user.count();
  const planCount = await db.plan.count();

  return NextResponse.json({
    success: true,
    message: "Setup complete. Passwords set for all demo users.",
    results,
    stats: { users: userCount, plans: planCount },
    credentials: {
      admin: "admin@creativo.app / Admin@2024",
      pro: "creator@creativo.app / Demo@2024",
      student: "student@creativo.app / Demo@2024",
      free: "free@creativo.app / Demo@2024",
      moderator: "mod@creativo.app / Demo@2024",
    },
  });
}

export async function POST() {
  try {
    return await handleSetup();
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return await handleSetup();
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
