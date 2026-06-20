import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  await requireAdmin();
  const announcements = await db.announcement.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      summary: a.summary,
      type: a.type,
      audience: a.audience,
      isPublished: a.isPublished,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
      author: a.author,
    })),
  });
}

export async function POST(req: Request) {
  const ctx = await requireAdmin();
  const adminId = ctx.user!.id;
  const body = await req.json().catch(() => ({}));
  const { title, summary, content, type, audience, publishNow, pin } = body as {
    title: string;
    summary?: string;
    content: string;
    type?: string;
    audience?: string;
    publishNow?: boolean;
    pin?: boolean;
  };

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const isPublished = Boolean(publishNow);
  const announcement = await db.announcement.create({
    data: {
      title,
      summary: summary || null,
      content,
      type: type || "info",
      audience: audience || "all",
      authorId: adminId,
      isPublished,
      isPinned: Boolean(pin),
      publishedAt: isPublished ? new Date() : null,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
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
      author: announcement.author,
    },
  });
}
