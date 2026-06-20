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
  if (typeof body.fullName === "string") data.fullName = body.fullName.trim() || null;
  if (typeof body.username === "string") {
    const username = body.username.trim();
    if (username) {
      const existing = await db.profile.findFirst({
        where: { username, NOT: { userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      data.username = username;
    } else {
      data.username = null;
    }
  }
  if (typeof body.bio === "string") data.bio = body.bio.trim() || null;
  if (typeof body.avatarUrl === "string") data.avatarUrl = body.avatarUrl.trim() || null;
  if (typeof body.location === "string") data.location = body.location.trim() || null;
  if (typeof body.website === "string") data.website = body.website.trim() || null;

  // Sync name to user.name
  if (typeof body.fullName === "string" && body.fullName.trim()) {
    await db.user.update({ where: { id: userId }, data: { name: body.fullName.trim() } });
  }

  const updated = await db.profile.update({ where: { userId }, data });

  await db.activityLog.create({
    data: {
      userId,
      action: "profile.update",
      category: "general",
      entity: "profile",
      entityId: userId,
      metadata: JSON.stringify({ fields: Object.keys(data) }),
    },
  });

  return NextResponse.json({ profile: updated });
}
