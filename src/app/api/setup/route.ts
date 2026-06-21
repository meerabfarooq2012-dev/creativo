import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData, ensureSuperAdmin } from "@/lib/auth/seed";

/**
 * POST /api/setup
 *
 * Initializes the database schema (db push) and seeds demo data.
 * Call this once after deploying to Vercel with a fresh Turso database.
 *
 * This route is protected by a setup secret to prevent abuse.
 */
export async function POST(req: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  const url = new URL(req.url);
  const providedSecret = url.searchParams.get("secret") ||
    req.headers.get("x-setup-secret");

  // If SETUP_SECRET is set, require it; otherwise allow (first-run convenience)
  if (setupSecret && providedSecret !== setupSecret) {
    return NextResponse.json(
      { error: "Unauthorized: invalid setup secret" },
      { status: 401 }
    );
  }

  try {
    // 1. Ensure plans + roles + super admin exist
    await ensureSeedData();
    await ensureSuperAdmin();

    // 2. Seed demo users if none exist (besides admin)
    const userCount = await db.user.count();
    if (userCount <= 1) {
      // Import the seed script's demo user creation
      const { hashPassword } = await import("@/lib/auth/password");
      const { ROLES } = await import("@/lib/permissions");

      const demoUsers = [
        {
          email: "creator@creativo.app",
          name: "Alex Creator",
          role: ROLES.PRO,
          plan: "PRO",
          password: "Demo@2024",
          bio: "Professional designer and illustrator.",
        },
        {
          email: "student@creativo.app",
          name: "Jamie Student",
          role: ROLES.STUDENT,
          plan: "STUDENT",
          password: "Demo@2024",
          bio: "Visual communication student.",
        },
        {
          email: "free@creativo.app",
          name: "Sam Free",
          role: ROLES.FREE_USER,
          plan: "FREE",
          password: "Demo@2024",
          bio: "Just exploring Creativo.",
        },
        {
          email: "mod@creativo.app",
          name: "Morgan Mod",
          role: ROLES.MODERATOR,
          plan: "PRO",
          password: "Demo@2024",
          bio: "Community moderator.",
        },
      ];

      for (const d of demoUsers) {
        const existing = await db.user.findUnique({ where: { email: d.email } });
        if (existing) continue;
        const hashed = await hashPassword(d.password);
        await db.user.create({
          data: {
            email: d.email,
            name: d.name,
            password: hashed,
            emailVerified: new Date(),
            status: "active",
            profile: {
              create: {
                fullName: d.name,
                username: d.email.split("@")[0],
                bio: d.bio,
                role: d.role,
                plan: d.plan,
                storageLimitMb:
                  d.plan === "PRO" ? 50000 : d.plan === "STUDENT" ? 5000 : 500,
                storageUsedMb: 0,
                emailVerified: true,
                emailVerifiedAt: new Date(),
              },
            },
            subscriptions: { create: { plan: d.plan, status: "active" } },
          },
        });
      }
    }

    const finalCount = await db.user.count();
    const planCount = await db.plan.count();

    return NextResponse.json({
      success: true,
      message: "Database setup complete. Demo users + plans seeded.",
      stats: {
        users: finalCount,
        plans: planCount,
      },
      credentials: {
        admin: "admin@creativo.app / Admin@2024",
        pro: "creator@creativo.app / Demo@2024",
        student: "student@creativo.app / Demo@2024",
        free: "free@creativo.app / Demo@2024",
        moderator: "mod@creativo.app / Demo@2024",
      },
    });
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
