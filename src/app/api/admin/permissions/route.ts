import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ROLE_PERMISSIONS, PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const ctx = await requireAdmin();
  const isSuperAdmin = (ctx.profile?.role ?? ctx.session.user.role) === "SUPER_ADMIN";

  const roles = await db.role.findMany({ orderBy: { name: "asc" } });

  const permissionGroups: Array<{ group: string; permissions: Array<{ key: string; label: string }> }> = [
    {
      group: "Projects",
      permissions: [
        { key: PERMISSIONS.PROJECT_CREATE, label: "Create" },
        { key: PERMISSIONS.PROJECT_EDIT_OWN, label: "Edit Own" },
        { key: PERMISSIONS.PROJECT_EDIT_ALL, label: "Edit All" },
        { key: PERMISSIONS.PROJECT_DELETE_OWN, label: "Delete Own" },
        { key: PERMISSIONS.PROJECT_DELETE_ALL, label: "Delete All" },
      ],
    },
    {
      group: "Assets",
      permissions: [
        { key: PERMISSIONS.ASSET_UPLOAD, label: "Upload" },
        { key: PERMISSIONS.ASSET_MANAGE_ALL, label: "Manage All" },
      ],
    },
    {
      group: "Access",
      permissions: [
        { key: PERMISSIONS.DASHBOARD_ACCESS, label: "Dashboard" },
        { key: PERMISSIONS.ADMIN_ACCESS, label: "Admin Console" },
      ],
    },
    {
      group: "User Management",
      permissions: [
        { key: PERMISSIONS.USER_VIEW_ALL, label: "View All" },
        { key: PERMISSIONS.USER_EDIT, label: "Edit" },
        { key: PERMISSIONS.USER_SUSPEND, label: "Suspend" },
        { key: PERMISSIONS.USER_BAN, label: "Ban" },
        { key: PERMISSIONS.USER_DELETE, label: "Delete" },
        { key: PERMISSIONS.USER_CHANGE_PLAN, label: "Change Plan" },
      ],
    },
    {
      group: "Subscriptions",
      permissions: [
        { key: PERMISSIONS.PLAN_MANAGE, label: "Manage Plans" },
        { key: PERMISSIONS.TRIAL_MANAGE, label: "Manage Trials" },
      ],
    },
    {
      group: "Support",
      permissions: [
        { key: PERMISSIONS.TICKET_VIEW_ALL, label: "View All" },
        { key: PERMISSIONS.TICKET_REPLY_ALL, label: "Reply" },
        { key: PERMISSIONS.TICKET_CLOSE, label: "Close" },
      ],
    },
    {
      group: "Announcements",
      permissions: [{ key: PERMISSIONS.ANNOUNCEMENT_MANAGE, label: "Manage" }],
    },
    {
      group: "Security",
      permissions: [
        { key: PERMISSIONS.SECURITY_VIEW_LOGS, label: "View Logs" },
        { key: PERMISSIONS.SECURITY_BLOCK_ACCOUNT, label: "Block Accounts" },
        { key: PERMISSIONS.SECURITY_MANAGE_PERMISSIONS, label: "Manage Permissions" },
      ],
    },
    {
      group: "System",
      permissions: [{ key: PERMISSIONS.SYSTEM_SETTINGS, label: "Settings" }],
    },
  ];

  const rolesWithPerms = roles.map((r) => {
    const perms = ROLE_PERMISSIONS[r.name] ?? [];
    return {
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      isSystem: r.isSystem,
      permissions: perms,
    };
  });

  return NextResponse.json({
    roles: rolesWithPerms,
    permissionKeys: permissionGroups,
    canManage: isSuperAdmin,
  });
}
