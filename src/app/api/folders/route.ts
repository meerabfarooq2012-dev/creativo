import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  const folders = await db.folder.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { projects: { where: { isDeleted: false } } } } },
  });

  return NextResponse.json({
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      icon: f.icon,
      sortOrder: f.sortOrder,
      parentId: f.parentId,
      projectCount: f._count.projects,
      createdAt: f.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
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

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const folder = await db.folder.create({
    data: { userId, name, color: body.color ?? null, icon: body.icon ?? null },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "folder.create",
      category: "project",
      entity: "folder",
      entityId: folder.id,
      metadata: JSON.stringify({ name }),
    },
  });

  return NextResponse.json({ folder }, { status: 201 });
}
