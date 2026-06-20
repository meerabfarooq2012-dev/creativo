import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    if (user.profile) {
      await db.profile.update({
        where: { userId: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    }

    await db.securityLog.create({
      data: { userId: user.id, event: "email_verify" },
    });

    return NextResponse.json({ ok: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
