import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const search = searchParams.get("search")?.trim() || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || "20")));

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { ticketNo: { contains: search } },
    ];
  }

  const [total, tickets] = await Promise.all([
    db.supportTicket.count({ where }),
    db.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const stats = {
    total: await db.supportTicket.count(),
    open: await db.supportTicket.count({ where: { status: "open" } }),
    pending: await db.supportTicket.count({ where: { status: "pending" } }),
    resolved: await db.supportTicket.count({ where: { status: "resolved" } }),
    closed: await db.supportTicket.count({ where: { status: "closed" } }),
  };

  const assignees = await db.user.findMany({
    where: { OR: [{ profile: { role: "ADMIN" } }, { profile: { role: "SUPER_ADMIN" } }, { profile: { role: "MODERATOR" } }] },
    select: { id: true, name: true, email: true },
    take: 50,
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      closedAt: t.closedAt ? t.closedAt.toISOString() : null,
      user: t.user,
      assignee: t.assignee,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    stats,
    assignees,
  });
}
