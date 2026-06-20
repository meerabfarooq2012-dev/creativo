export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  bannedReason: string | null;
  bannedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  role: string;
  plan: string;
  storageUsedMb: number;
  storageLimitMb: number;
  trialActive: boolean;
  trialEndsAt: string | null;
}

export interface AdminPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  storageLimitMb: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface AdminSubscription {
  id: string;
  plan: string;
  status: string;
  startedAt: string;
  endsAt: string | null;
  trialEndsAt: string | null;
  amount: number;
  currency: string;
  interval: string | null;
  user: { id: string; name: string | null; email: string };
}

export interface AdminProject {
  id: string;
  name: string;
  type: string;
  status: string;
  isDeleted: boolean;
  deletedAt: string | null;
  sizeBytes: number;
  createdAt: string;
  lastOpenedAt: string | null;
  user: { id: string; name: string | null; email: string };
}

export interface AdminAsset {
  id: string;
  name: string;
  type: string;
  category: string | null;
  url: string;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

export interface AdminTicket {
  id: string;
  ticketNo: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  user: { id: string; name: string | null; email: string };
  assignee?: { id: string; name: string | null; email: string } | null;
  replies: Array<{
    id: string;
    message: string;
    isStaff: boolean;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  type: string;
  audience: string;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  createdAt: string;
  author?: { id: string; name: string | null; email: string } | null;
}

export interface AdminLog {
  id: string;
  event: string;
  action?: string;
  category?: string | null;
  ip: string | null;
  location?: string | null;
  createdAt: string;
  user?: { id: string; name: string | null; email: string } | null;
  admin?: { id: string; name: string | null; email: string } | null;
  targetUserId?: string | null;
  targetEntity?: string | null;
  details?: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalProjects: number;
  storageUsedMb: number;
  activeSubscriptions: number;
  totalRevenue: number;
  openTickets: number;
  userGrowth: Array<{ date: string; total: number; new: number }>;
  newUsersDaily: Array<{ date: string; count: number }>;
  planDistribution: Array<{ plan: string; count: number }>;
  projectsByType: Array<{ type: string; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    category: string;
    createdAt: string;
    user?: { name: string | null; email: string } | null;
  }>;
  recentSignups: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    role: string;
    plan: string;
  }>;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

export interface PermissionsMatrix {
  roles: RoleWithPermissions[];
  permissionKeys: Array<{ group: string; permissions: Array<{ key: string; label: string }> }>;
}
