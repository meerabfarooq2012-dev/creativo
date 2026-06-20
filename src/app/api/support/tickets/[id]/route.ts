import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const ticket = await db.supportTicket.findFirst({
    where: { id, userId },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

export async function PATCH(req: NextRequest, props: Params) {
  const ctx = await getCurrentUser();
  if (!ctx?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = ctx.user.id;
  const { id } = await props.params;

  const ticket = await db.supportTicket.findFirst({ where: { id, userId } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body is ok — defaults to closing
  }

  const newStatus = typeof body.status === "string" ? body.status : "closed";
  if (!["open", "pending", "resolved", "closed"].includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db.supportTicket.update({
    where: { id },
    data: {
      status: newStatus,
      closedAt: newStatus === "closed" ? new Date() : null,
    },
  });

  return NextResponse.json({ ticket: updated });
}
