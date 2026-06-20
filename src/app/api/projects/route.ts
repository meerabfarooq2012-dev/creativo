import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status"); // active | archived
  const favorite = searchParams.get("favorite");
  const search = searchParams.get("search");
  const folderId = searchParams.get("folderId");

  const where: any = { userId, isDeleted: false };
  if (type && type !== "all") where.type = type;
  if (status === "active") where.status = "active";
  if (status === "archived") where.status = "archived";
  if (favorite === "true") where.isFavorite = true;
  if (folderId === "none") where.folderId = null;
  else if (folderId && folderId !== "all") where.folderId = folderId;
  if (search) {
    where.name = { contains: search };
  }

  const projects = await db.project.findMany({
    where,
    orderBy: [{ lastOpenedAt: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ projects });
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
  const type = String(body.type ?? "design").trim();
  const folderId = body.folderId ? String(body.folderId) : null;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!["design", "illustration", "photo", "video", "animation"].includes(type)) {
    return NextResponse.json({ error: "Invalid project type" }, { status: 400 });
  }

  // Verify folder ownership if provided
  if (folderId) {
    const folder = await db.folder.findFirst({ where: { id: folderId, userId } });
    if (!folder) return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const project = await db.project.create({
    data: { userId, name, type, folderId: folderId ?? null, lastOpenedAt: new Date() },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "project.create",
      category: "project",
      entity: "project",
      entityId: project.id,
      metadata: JSON.stringify({ name, type }),
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
