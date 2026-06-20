import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const includeDeleted = searchParams.get("includeDeleted") === "true";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "20")));

  const where: any = {};
  if (!includeDeleted) where.isDeleted = false;
  else if (status === "deleted") where.isDeleted = true;
  if (type) where.type = type;
  if (search) where.name = { contains: search };

  const [total, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      isDeleted: p.isDeleted,
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
      sizeBytes: p.sizeBytes,
      createdAt: p.createdAt.toISOString(),
      lastOpenedAt: p.lastOpenedAt ? p.lastOpenedAt.toISOString() : null,
      user: p.user,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
