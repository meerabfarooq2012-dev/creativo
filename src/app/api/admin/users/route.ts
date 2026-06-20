import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeUser } from "@/lib/admin/serializers";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const plan = searchParams.get("plan") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "10")));

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
    ];
  }
  if (role) where.profile = { ...where.profile, role };
  if (plan) where.profile = { ...where.profile, plan };
  if (status) where.status = status;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const counts = {
    total: await db.user.count(),
    active: await db.user.count({ where: { status: "active" } }),
    suspended: await db.user.count({ where: { status: "suspended" } }),
    banned: await db.user.count({ where: { status: "banned" } }),
  };

  return NextResponse.json({
    users: users.map(serializeUser),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts,
  });
}
