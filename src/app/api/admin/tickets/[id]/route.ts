import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, props: Params) {
  await requireAdmin();
  const { id } = await props.params;
  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt ? ticket.closedAt.toISOString() : null,
      user: ticket.user,
      assignee: ticket.assignee,
      replies: ticket.replies.map((r) => ({
        id: r.id,
        message: r.message,
        isStaff: r.isStaff,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    },
  });
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { status, assignedTo } = body as { status?: string; assignedTo?: string | null };

  const existing = await db.supportTicket.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const data: any = {};
  if (status) {
    data.status = status;
    if (status === "closed" || status === "resolved") data.closedAt = new Date();
    if (status === "open" || status === "pending") data.closedAt = null;
  }
  if (assignedTo !== undefined) data.assignedTo = assignedTo || null;

  const ticket = await db.supportTicket.update({ where: { id }, data });

  await logAdminAction({
    adminId,
    action: "ticket.update",
    targetEntity: "SupportTicket",
    targetEntityId: id,
    details: JSON.stringify(data),
    ip: getIp(req),
  });

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
    },
  });
}
