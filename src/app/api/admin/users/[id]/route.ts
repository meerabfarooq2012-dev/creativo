import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeUser, planStorageLimit } from "@/lib/admin/serializers";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, props: Params) {
  await requireAdmin();
  const { id } = await props.params;
  const user = await db.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user: serializeUser(user) });
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { name, role, plan, status } = body as {
    name?: string;
    role?: string;
    plan?: string;
    status?: string;
  };

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const profileUpdates: any = {};
  if (role) profileUpdates.role = role;
  if (plan) {
    profileUpdates.plan = plan;
    profileUpdates.storageLimitMb = planStorageLimit(plan);
  }
  const userUpdates: any = {};
  if (typeof name === "string" && name.trim()) userUpdates.name = name.trim();
  if (status) {
    userUpdates.status = status;
    if (status === "active") {
      userUpdates.bannedReason = null;
      userUpdates.bannedAt = null;
    }
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      ...userUpdates,
      profile: Object.keys(profileUpdates).length
        ? { update: { ...profileUpdates } }
        : undefined,
    },
    include: { profile: true },
  });

  await logAdminAction({
    adminId,
    action: "user.edit",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: JSON.stringify({ name, role, plan, status }),
    ip: getIp(req),
  });

  return NextResponse.json({ user: serializeUser(updated) });
}

export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  if (id === adminId) {
    return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if ((existing.profile?.role ?? "FREE_USER") === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot delete a Super Admin account" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });

  await logAdminAction({
    adminId,
    action: "user.delete",
    targetUserId: id,
    targetEntity: "User",
    targetEntityId: id,
    details: JSON.stringify({ email: existing.email }),
    ip: getIp(req),
  });

  return NextResponse.json({ success: true });
}
