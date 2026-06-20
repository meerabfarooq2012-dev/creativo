import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

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

export async function GET() {
  await requireAdmin();
  const plans = await db.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans: plans.map(serializePlan) });
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const { name, displayName, description, priceMonthly, priceYearly, storageLimitMb, features, isActive, isPopular, sortOrder } = body;

  if (!name || !displayName) {
    return NextResponse.json({ error: "Name and display name are required" }, { status: 400 });
  }

  const existing = await db.plan.findUnique({ where: { name: name.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Plan with this name already exists" }, { status: 400 });

  const plan = await db.plan.create({
    data: {
      name: name.toUpperCase(),
      displayName,
      description: description || null,
      priceMonthly: Number(priceMonthly) || 0,
      priceYearly: Number(priceYearly) || 0,
      storageLimitMb: Number(storageLimitMb) || 500,
      features: JSON.stringify(Array.isArray(features) ? features : []),
      isActive: Boolean(isActive),
      isPopular: Boolean(isPopular),
      sortOrder: Number(sortOrder) || 0,
    },
  });

  return NextResponse.json({ plan: serializePlan(plan) });
}
