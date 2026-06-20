import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const message = (body.message as string)?.trim();

  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const ticket = await db.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const reply = await db.ticketReply.create({
    data: { ticketId: id, userId: adminId, message, isStaff: true },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  // Auto-set ticket status to pending (awaiting user reply) if currently open
  await db.supportTicket.update({
    where: { id },
    data: { status: ticket.status === "closed" ? "closed" : "pending" },
  });

  await logAdminAction({
    adminId,
    action: "ticket.reply",
    targetEntity: "SupportTicket",
    targetEntityId: id,
    details: JSON.stringify({ messageId: reply.id }),
    ip: getIp(req),
  });

  return NextResponse.json({
    reply: {
      id: reply.id,
      message: reply.message,
      isStaff: reply.isStaff,
      createdAt: reply.createdAt.toISOString(),
      user: reply.user,
    },
  });
}
