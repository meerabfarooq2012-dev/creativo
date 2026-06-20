import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await db.project.delete({ where: { id } });

  await logAdminAction({
    adminId,
    action: "project.permanent_delete",
    targetEntity: "Project",
    targetEntityId: id,
    details: JSON.stringify({ name: existing.name, userId: existing.userId }),
    ip: getIp(req),
  });

  return NextResponse.json({ success: true });
}
