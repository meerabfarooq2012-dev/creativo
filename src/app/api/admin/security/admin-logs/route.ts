import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "30")));

  const [total, adminLogs, bannedAccounts] = await Promise.all([
    db.adminLog.count(),
    db.adminLog.findMany({
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.findMany({
      where: { status: { in: ["banned", "suspended"] } },
      include: { profile: { select: { role: true, plan: true } } },
      orderBy: { bannedAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    adminLogs: adminLogs.map((l) => ({
      id: l.id,
      action: l.action,
      targetUserId: l.targetUserId,
      targetEntity: l.targetEntity,
      targetEntityId: l.targetEntityId,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
      admin: l.admin,
    })),
    total,
    page,
    pageSize,
    bannedAccounts: bannedAccounts.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      bannedReason: u.bannedReason,
      bannedAt: u.bannedAt ? u.bannedAt.toISOString() : null,
      role: u.profile?.role ?? "FREE_USER",
      plan: u.profile?.plan ?? "FREE",
    })),
  });
}
