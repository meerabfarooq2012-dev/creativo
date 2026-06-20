import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const project = await db.project.findFirst({ where: { id, userId, isDeleted: false } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy = await db.project.create({
    data: {
      userId,
      name: `${project.name} (Copy)`,
      type: project.type,
      description: project.description,
      folderId: project.folderId,
      thumbnail: project.thumbnail,
      status: "active",
      isFavorite: false,
      sizeBytes: project.sizeBytes,
      metadata: project.metadata,
    },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "project.duplicate",
      category: "project",
      entity: "project",
      entityId: copy.id,
      metadata: JSON.stringify({ sourceId: id, name: copy.name }),
    },
  });

  return NextResponse.json({ project: copy }, { status: 201 });
}
