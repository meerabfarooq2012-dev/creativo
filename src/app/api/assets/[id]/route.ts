import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const asset = await db.asset.findFirst({ where: { id, userId } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Try to remove file from disk
  if (asset.url?.startsWith("/uploads/")) {
    const relPath = asset.url.slice("/uploads/".length);
    const abs = path.join(process.cwd(), "public", "uploads", relPath);
    try {
      await fs.unlink(abs);
    } catch {
      // ignore file-missing errors
    }
  }

  // Soft delete asset
  await db.asset.update({ where: { id }, data: { isDeleted: true } });

  // Update storage usage
  const fileMb = asset.fileSize / (1024 * 1024);
  await db.profile.update({
    where: { userId },
    data: { storageUsedMb: { decrement: fileMb } },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "asset.delete",
      category: "general",
      entity: "asset",
      entityId: id,
      metadata: JSON.stringify({ name: asset.name }),
    },
  });

  return NextResponse.json({ success: true });
}
