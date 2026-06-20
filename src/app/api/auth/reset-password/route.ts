import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { verifyResetToken } from "@/lib/auth/seed";

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const record = await verifyResetToken(token);
    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email: record.identifier } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashed = await hashPassword(password);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await db.verificationToken.delete({ where: { token } });

    await db.securityLog.create({
      data: {
        userId: user.id,
        event: "password_change",
        metadata: JSON.stringify({ via: "reset" }),
      },
    });

    return NextResponse.json({ ok: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
