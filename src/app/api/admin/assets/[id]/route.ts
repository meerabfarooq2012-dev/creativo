import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

function serializeAsset(a: any) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(a.tags || "[]");
  } catch {}
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    category: a.category,
    url: a.url,
    thumbnailUrl: a.thumbnailUrl,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    tags,
    isPublic: a.isPublic,
    isDeleted: a.isDeleted,
    createdAt: a.createdAt.toISOString(),
    user: a.user ? { id: a.user.id, name: a.user.name, email: a.user.email } : null,
  };
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { name, category, tags, isPublic } = body as {
    name?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  };

  const existing = await db.asset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  const data: any = {};
  if (typeof name === "string") data.name = name;
  if (typeof category === "string") data.category = category || null;
  if (Array.isArray(tags)) data.tags = JSON.stringify(tags);
  if (isPublic !== undefined) data.isPublic = Boolean(isPublic);

  const asset = await db.asset.update({ where: { id }, data, include: { user: { select: { id: true, name: true, email: true } } } });

  await logAdminAction({
    adminId,
    action: "asset.update",
    targetEntity: "Asset",
    targetEntityId: id,
    details: JSON.stringify(data),
    ip: getIp(req),
  });

  return NextResponse.json({ asset: serializeAsset(asset) });
}

export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.asset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  await db.asset.delete({ where: { id } });

  await logAdminAction({
    adminId,
    action: "asset.delete",
    targetEntity: "Asset",
    targetEntityId: id,
    details: JSON.stringify({ name: existing.name, type: existing.type }),
    ip: getIp(req),
  });

  return NextResponse.json({ success: true });
}
