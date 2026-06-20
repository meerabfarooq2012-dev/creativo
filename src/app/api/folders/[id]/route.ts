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

  const folder = await db.folder.findFirst({ where: { id, userId } });
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.color === "string") data.color = body.color;
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  const updated = await db.folder.update({ where: { id }, data });
  return NextResponse.json({ folder: updated });
}

export async function DELETE(_req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const folder = await db.folder.findFirst({ where: { id, userId } });
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Detach projects (set folderId to null), then delete folder
  await db.project.updateMany({ where: { folderId: id, userId }, data: { folderId: null } });
  await db.folder.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
