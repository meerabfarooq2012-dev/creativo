import { db } from "@/lib/db";

/**
 * Logs an admin action to AdminLog. Failures are non-fatal (swallowed).
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetUserId?: string | null;
  targetEntity?: string | null;
  targetEntityId?: string | null;
  details?: string | null;
  ip?: string | null;
}) {
  try {
    await db.adminLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetUserId: params.targetUserId ?? null,
        targetEntity: params.targetEntity ?? null,
        targetEntityId: params.targetEntityId ?? null,
        details: params.details ?? null,
        ip: params.ip ?? null,
      },
    });
  } catch (e) {
    // swallow — logging must not break the main flow
    console.error("[logAdminAction] failed:", e);
  }
}

export function getIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}
