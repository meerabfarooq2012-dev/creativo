import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const ticket = await db.supportTicket.findFirst({ where: { id, userId } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const reply = await db.ticketReply.create({
    data: { ticketId: id, userId, message, isStaff: false },
  });

  // Move ticket back to pending if it was closed
  if (ticket.status === "closed") {
    await db.supportTicket.update({ where: { id }, data: { status: "pending", closedAt: null } });
  }

  return NextResponse.json({ reply }, { status: 201 });
}
