import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

// Soft delete
export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const project = await db.project.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), status: "deleted" },
  });

  await logAdminAction({
    adminId,
    action: "project.soft_delete",
    targetEntity: "Project",
    targetEntityId: id,
    details: JSON.stringify({ name: existing.name }),
    ip: getIp(req),
  });

  return NextResponse.json({ project });
}
