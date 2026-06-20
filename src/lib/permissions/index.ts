// Creativo - Roles & Permissions
// Role hierarchy: SUPER_ADMIN > ADMIN > MODERATOR > PRO > STUDENT > FREE_USER

export const ROLES = {
  FREE_USER: "FREE_USER",
  STUDENT: "STUDENT",
  PRO: "PRO",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

export const ROLE_DISPLAY: Record<string, { label: string; description: string; color: string }> = {
  FREE_USER: { label: "Free User", description: "Basic access with limited features", color: "bg-slate-500" },
  STUDENT: { label: "Student", description: "Discounted plan for students", color: "bg-blue-500" },
  PRO: { label: "Pro", description: "Advanced features for professionals", color: "bg-violet-500" },
  MODERATOR: { label: "Moderator", description: "Content moderation access", color: "bg-amber-500" },
  ADMIN: { label: "Admin", description: "Administrative dashboard access", color: "bg-rose-500" },
  SUPER_ADMIN: { label: "Super Admin", description: "Full system control", color: "bg-fuchsia-500" },
};

// Role hierarchy level (higher = more powerful)
export const ROLE_LEVEL: Record<string, number> = {
  FREE_USER: 10,
  STUDENT: 20,
  PRO: 30,
  MODERATOR: 70,
  ADMIN: 90,
  SUPER_ADMIN: 100,
};

// Permission keys
export const PERMISSIONS = {
  // Projects
  PROJECT_CREATE: "project:create",
  PROJECT_EDIT_OWN: "project:edit_own",
  PROJECT_EDIT_ALL: "project:edit_all",
  PROJECT_DELETE_OWN: "project:delete_own",
  PROJECT_DELETE_ALL: "project:delete_all",
  // Storage
  ASSET_UPLOAD: "asset:upload",
  ASSET_MANAGE_ALL: "asset:manage_all",
  // Dashboard
  DASHBOARD_ACCESS: "dashboard:access",
  // Admin
  ADMIN_ACCESS: "admin:access",
  // User management
  USER_VIEW_ALL: "user:view_all",
  USER_EDIT: "user:edit",
  USER_SUSPEND: "user:suspend",
  USER_BAN: "user:ban",
  USER_DELETE: "user:delete",
  USER_CHANGE_PLAN: "user:change_plan",
  // Subscriptions
  PLAN_MANAGE: "plan:manage",
  TRIAL_MANAGE: "trial:manage",
  // Support
  TICKET_VIEW_ALL: "ticket:view_all",
  TICKET_REPLY_ALL: "ticket:reply_all",
  TICKET_CLOSE: "ticket:close",
  // Announcements
  ANNOUNCEMENT_MANAGE: "announcement:manage",
  // Security
  SECURITY_VIEW_LOGS: "security:view_logs",
  SECURITY_BLOCK_ACCOUNT: "security:block_account",
  SECURITY_MANAGE_PERMISSIONS: "security:manage_permissions",
  // System
  SYSTEM_SETTINGS: "system:settings",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role → permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  FREE_USER: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_OWN,
    PERMISSIONS.PROJECT_DELETE_OWN,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.DASHBOARD_ACCESS,
  ],
  STUDENT: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_OWN,
    PERMISSIONS.PROJECT_DELETE_OWN,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.DASHBOARD_ACCESS,
  ],
  PRO: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_OWN,
    PERMISSIONS.PROJECT_DELETE_OWN,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.DASHBOARD_ACCESS,
  ],
  MODERATOR: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_OWN,
    PERMISSIONS.PROJECT_DELETE_OWN,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.DASHBOARD_ACCESS,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.TICKET_VIEW_ALL,
    PERMISSIONS.TICKET_REPLY_ALL,
    PERMISSIONS.TICKET_CLOSE,
    PERMISSIONS.ASSET_MANAGE_ALL,
  ],
  ADMIN: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_OWN,
    PERMISSIONS.PROJECT_EDIT_ALL,
    PERMISSIONS.PROJECT_DELETE_OWN,
    PERMISSIONS.PROJECT_DELETE_ALL,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.ASSET_MANAGE_ALL,
    PERMISSIONS.DASHBOARD_ACCESS,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_CHANGE_PLAN,
    PERMISSIONS.PLAN_MANAGE,
    PERMISSIONS.TRIAL_MANAGE,
    PERMISSIONS.TICKET_VIEW_ALL,
    PERMISSIONS.TICKET_REPLY_ALL,
    PERMISSIONS.TICKET_CLOSE,
    PERMISSIONS.ANNOUNCEMENT_MANAGE,
    PERMISSIONS.SECURITY_VIEW_LOGS,
    PERMISSIONS.SECURITY_BLOCK_ACCOUNT,
  ],
  SUPER_ADMIN: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
};

export function hasPermission(role: string | undefined | null, permission: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes(permission);
}

export function hasAnyPermission(role: string | undefined | null, permissions: string[]): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return permissions.some((p) => perms.includes(p));
}

export function isAdmin(role: string | undefined | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

export function isStaff(role: string | undefined | null): boolean {
  return (
    role === ROLES.MODERATOR ||
    role === ROLES.ADMIN ||
    role === ROLES.SUPER_ADMIN
  );
}

export function roleAtLeast(role: string | undefined | null, minRole: string): boolean {
  if (!role) return false;
  return (ROLE_LEVEL[role] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
}
