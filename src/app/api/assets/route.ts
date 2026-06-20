import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  const where: any = { userId, isDeleted: false };
  if (type && type !== "all") where.type = type;
  if (search) where.name = { contains: search };

  const assets = await db.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const type = String(formData.get("type") ?? "image");
  const category = formData.get("category") ? String(formData.get("category")) : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  if (!["image", "icon", "font", "sticker", "shape", "template"].includes(type)) {
    return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
  }

  // Enforce storage limit
  const profile = ctx.profile;
  const limitMb = profile?.storageLimitMb ?? 500;
  const usedMb = profile?.storageUsedMb ?? 0;
  const fileMb = file.size / (1024 * 1024);
  if (usedMb + fileMb > limitMb) {
    return NextResponse.json(
      { error: "Storage limit exceeded. Upgrade your plan to upload more files." },
      { status: 413 }
    );
  }

  // Sanitize filename & ensure dir
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
  await fs.mkdir(uploadDir, { recursive: true });

  // Avoid overwrites — append timestamp if needed
  let finalName = safeName;
  try {
    await fs.access(path.join(uploadDir, finalName));
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    finalName = `${base}-${Date.now()}${ext}`;
  } catch {
    // doesn't exist, use original
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(path.join(uploadDir, finalName), buffer);

  const url = `/uploads/${userId}/${finalName}`;
  const mimeType = file.type || "application/octet-stream";

  // Determine dimensions for images (without sharp to keep it simple)
  let width: number | null = null;
  let height: number | null = null;

  const asset = await db.asset.create({
    data: {
      userId,
      name: safeName,
      type,
      category,
      url,
      thumbnailUrl: type === "image" ? url : null,
      fileSize: file.size,
      mimeType,
      width,
      height,
      tags: JSON.stringify([]),
      isPublic: false,
    },
  });

  // Update storage usage
  await db.profile.update({
    where: { userId },
    data: { storageUsedMb: { increment: fileMb } },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "asset.upload",
      category: "general",
      entity: "asset",
      entityId: asset.id,
      metadata: JSON.stringify({ name: safeName, type, size: file.size }),
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
