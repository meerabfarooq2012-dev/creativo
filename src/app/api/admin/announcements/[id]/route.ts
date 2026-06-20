import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, getIp } from "@/lib/admin/log";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;
  const body = await req.json().catch(() => ({}));
  const { title, summary, content, type, audience, isPublished, isPinned } = body as {
    title?: string;
    summary?: string;
    content?: string;
    type?: string;
    audience?: string;
    isPublished?: boolean;
    isPinned?: boolean;
  };

  const existing = await db.announcement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  const data: any = {};
  if (typeof title === "string") data.title = title;
  if (summary !== undefined) data.summary = summary || null;
  if (typeof content === "string") data.content = content;
  if (type) data.type = type;
  if (audience) data.audience = audience;
  if (isPublished !== undefined) {
    data.isPublished = Boolean(isPublished);
    if (isPublished && !existing.publishedAt) data.publishedAt = new Date();
    if (!isPublished) data.publishedAt = null;
  }
  if (isPinned !== undefined) data.isPinned = Boolean(isPinned);

  const announcement = await db.announcement.update({ where: { id }, data });

  await logAdminAction({
    adminId,
    action: "announcement.update",
    targetEntity: "Announcement",
    targetEntityId: id,
    details: JSON.stringify(data),
    ip: getIp(req),
  });

  return NextResponse.json({
    announcement: {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      summary: announcement.summary,
      type: announcement.type,
      audience: announcement.audience,
      isPublished: announcement.isPublished,
      isPinned: announcement.isPinned,
      publishedAt: announcement.publishedAt ? announcement.publishedAt.toISOString() : null,
      createdAt: announcement.createdAt.toISOString(),
    },
  });
}

export async function DELETE(req: Request, props: Params) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const { id } = await props.params;

  const existing = await db.announcement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  await db.announcement.delete({ where: { id } });

  await logAdminAction({
    adminId,
    action: "announcement.delete",
    targetEntity: "Announcement",
    targetEntityId: id,
    details: JSON.stringify({ title: existing.title }),
    ip: getIp(req),
  });

  return NextResponse.json({ success: true });
}
