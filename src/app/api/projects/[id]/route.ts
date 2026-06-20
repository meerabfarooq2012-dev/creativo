import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const project = await db.project.findFirst({ where: { id, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.isFavorite === "boolean") data.isFavorite = body.isFavorite;
  if (typeof body.status === "string" && ["active", "archived"].includes(body.status)) {
    data.status = body.status;
  }
  if (body.folderId !== undefined) {
    if (body.folderId === null) {
      data.folderId = null;
    } else {
      const folder = await db.folder.findFirst({ where: { id: String(body.folderId), userId } });
      if (!folder) return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
      data.folderId = folder.id;
    }
  }
  if (typeof body.lastOpened === "boolean" && body.lastOpened) {
    data.lastOpenedAt = new Date();
  }

  const updated = await db.project.update({ where: { id }, data });

  await db.activityLog.create({
    data: {
      userId,
      action: "project.update",
      category: "project",
      entity: "project",
      entityId: id,
      metadata: JSON.stringify({ fields: Object.keys(data) }),
    },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const project = await db.project.findFirst({ where: { id, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft delete
  await db.project.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), status: "archived" },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "project.delete",
      category: "project",
      entity: "project",
      entityId: id,
      metadata: JSON.stringify({ name: project.name }),
    },
  });

  return NextResponse.json({ success: true });
}
