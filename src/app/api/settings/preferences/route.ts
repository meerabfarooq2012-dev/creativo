import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

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

  const data: any = {};
  if (typeof body.notifyEmail === "boolean") data.notifyEmail = body.notifyEmail;
  if (typeof body.notifyPush === "boolean") data.notifyPush = body.notifyPush;
  if (typeof body.notifySecurity === "boolean") data.notifySecurity = body.notifySecurity;
  if (typeof body.language === "string" && ["en", "es", "fr", "de", "pt"].includes(body.language)) {
    data.language = body.language;
  }
  if (typeof body.themePreference === "string" && ["light", "dark"].includes(body.themePreference)) {
    data.themePreference = body.themePreference;
  }

  const updated = await db.profile.update({ where: { userId }, data });
  return NextResponse.json({ profile: updated });
}
