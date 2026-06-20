import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth/seed";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await createPasswordResetToken(email.toLowerCase().trim());
    // Always return success to prevent email enumeration
    if (!result) {
      return NextResponse.json({
        ok: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    // In production this would email the link. For the foundation, return it
    // so the demo flow can continue.
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${result.token}`;

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
      // Demo only: expose reset URL in dev
      ...(process.env.NODE_ENV !== "production"
        ? { devResetUrl: resetUrl }
        : {}),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
