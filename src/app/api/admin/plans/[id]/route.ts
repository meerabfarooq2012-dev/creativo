import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

function serializePlan(p: any) {
  let features: string[] = [];
  try {
    features = JSON.parse(p.features || "[]");
  } catch {}
  return {
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    description: p.description,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    storageLimitMb: p.storageLimitMb,
    features,
    isActive: p.isActive,
    isPopular: p.isPopular,
    sortOrder: p.sortOrder,
  };
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { displayName, description, priceMonthly, priceYearly, storageLimitMb, features, isActive, isPopular, sortOrder } = body;

  const existing = await db.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const data: any = {};
  if (typeof displayName === "string") data.displayName = displayName;
  if (typeof description === "string") data.description = description;
  if (priceMonthly !== undefined) data.priceMonthly = Number(priceMonthly);
  if (priceYearly !== undefined) data.priceYearly = Number(priceYearly);
  if (storageLimitMb !== undefined) data.storageLimitMb = Number(storageLimitMb);
  if (Array.isArray(features)) data.features = JSON.stringify(features);
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  if (isPopular !== undefined) data.isPopular = Boolean(isPopular);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

  const plan = await db.plan.update({ where: { id }, data });

  await logAdminAction({
    adminId,
    action: "plan.update",
    targetEntity: "Plan",
    targetEntityId: id,
    details: JSON.stringify(data),
    ip: getIp(req),
  });

  return NextResponse.json({ plan: serializePlan(plan) });
}

export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (existing.name === "FREE") {
    return NextResponse.json({ error: "Cannot delete the default Free plan" }, { status: 400 });
  }

  // Detach users on this plan back to FREE
  await db.profile.updateMany({ where: { plan: existing.name }, data: { plan: "FREE", storageLimitMb: 500 } });
  await db.plan.delete({ where: { id } });

  await logAdminAction({
    adminId,
    action: "plan.delete",
    targetEntity: "Plan",
    targetEntityId: id,
    details: JSON.stringify({ name: existing.name }),
    ip: getIp(req),
  });

  return NextResponse.json({ success: true });
}
