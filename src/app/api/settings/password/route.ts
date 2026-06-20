import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

export async function PATCH(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = body.currentPassword;
  const next = body.newPassword;
  if (typeof current !== "string" || typeof next !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (next.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "Account has no password" }, { status: 400 });
  }

  const ok = await verifyPassword(current, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  const hashed = await hashPassword(next);
  await db.user.update({ where: { id: userId }, data: { password: hashed } });

  await db.securityLog.create({
    data: { userId, event: "password_change" },
  });
  await db.activityLog.create({
    data: {
      userId,
      action: "password.change",
      category: "general",
      entity: "user",
      entityId: userId,
    },
  });

  return NextResponse.json({ success: true });
}
