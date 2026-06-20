import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  const tickets = await db.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      subject: t.subject,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      closedAt: t.closedAt,
      replyCount: t._count.replies,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "general");
  const priority = String(body.priority ?? "medium");

  if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!["general", "billing", "technical", "account", "bug"].includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!["low", "medium", "high", "urgent"].includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  // Generate ticketNo TKT-XXXX
  const count = await db.supportTicket.count();
  const ticketNo = `TKT-${1000 + count + 1}`;

  const ticket = await db.supportTicket.create({
    data: { ticketNo, userId, subject, description, category, priority, status: "open" },
  });

  await db.activityLog.create({
    data: {
      userId,
      action: "ticket.create",
      category: "general",
      entity: "ticket",
      entityId: ticket.id,
      metadata: JSON.stringify({ ticketNo, subject }),
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
