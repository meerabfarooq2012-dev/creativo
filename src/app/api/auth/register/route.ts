import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/permissions";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const baseUsername = normalizedEmail.split("@")[0];
    let username = baseUsername;
    let suffix = 1;
    while (await db.profile.findUnique({ where: { username } })) {
      username = `${baseUsername}${suffix++}`;
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            fullName: name,
            username,
            role: ROLES.FREE_USER,
            plan: "FREE",
            storageLimitMb: 500,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        },
        subscriptions: {
          create: {
            plan: "FREE",
            status: "active",
          },
        },
      },
      include: { profile: true },
    });

    // Welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "system",
        title: "Welcome to Creativo! 🎨",
        message:
          "Your creative journey starts now. Explore templates, create your first project, and bring your ideas to life.",
      },
    });

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "user.registered",
        category: "auth",
        metadata: JSON.stringify({ email: normalizedEmail }),
      },
    });

    await db.securityLog.create({
      data: {
        userId: user.id,
        event: "login_success",
        metadata: JSON.stringify({ note: "registration" }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Account created successfully. Please sign in.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
