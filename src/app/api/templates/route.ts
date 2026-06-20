import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: any = { isActive: true };
  if (category && category !== "all") where.category = category;
  if (search) where.name = { contains: search };

  const templates = await db.template.findMany({
    where,
    orderBy: [{ isPremium: "asc" }, { sortOrder: "asc" }, { usageCount: "desc" }],
    take: 100,
  });

  return NextResponse.json({
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      thumbnailUrl: t.thumbnailUrl,
      previewUrl: t.previewUrl,
      isPremium: t.isPremium,
      usageCount: t.usageCount,
      tags: t.tags,
    })),
  });
}
