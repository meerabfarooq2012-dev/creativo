import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

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

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search")?.trim() || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "24")));

  const where: any = { isDeleted: false };
  if (type) where.type = type;
  if (search) where.name = { contains: search };

  const [total, assets] = await Promise.all([
    db.asset.count({ where }),
    db.asset.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    assets: assets.map(serializeAsset),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(req: Request) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;

  const formData = await req.formData();
  const name = String(formData.get("name") || "");
  const type = String(formData.get("type") || "image");
  const category = String(formData.get("category") || "");
  const tagsStr = String(formData.get("tags") || "");
  const isPublic = formData.get("isPublic") === "true";
  const file = formData.get("file") as File | null;

  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
  }

  let url = String(formData.get("url") || "");
  let fileSize = 0;
  let mimeType: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const relativePath = `/uploads/${Date.now()}-${safeName}`;
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, `${Date.now()}-${safeName}`), buffer);
    url = relativePath;
    fileSize = file.size;
    mimeType = file.type || null;
  } else if (!url) {
    return NextResponse.json({ error: "Either file upload or url is required" }, { status: 400 });
  }

  let tags: string[] = [];
  try {
    tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
  } catch {}

  const asset = await db.asset.create({
    data: {
      name,
      type,
      category: category || null,
      url,
      thumbnailUrl: type === "image" ? url : null,
      fileSize,
      mimeType,
      width,
      height,
      tags: JSON.stringify(tags),
      isPublic,
      userId: adminId,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ asset: serializeAsset(asset) });
}
