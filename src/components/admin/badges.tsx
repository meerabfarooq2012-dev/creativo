import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "border-transparent bg-fuchsia-500/15 text-fuchsia-300",
  ADMIN: "border-transparent bg-rose-500/15 text-rose-300",
  MODERATOR: "border-transparent bg-amber-500/15 text-amber-300",
  PRO: "border-transparent bg-violet-500/15 text-violet-300",
  STUDENT: "border-transparent bg-sky-500/15 text-sky-300",
  FREE_USER: "border-transparent bg-slate-500/15 text-slate-300",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  PRO: "Pro",
  STUDENT: "Student",
  FREE_USER: "Free",
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(ROLE_STYLES[role] ?? ROLE_STYLES.FREE_USER, className)}>
      {ROLE_LABELS[role] ?? role}
    </Badge>
  );
}

const PLAN_STYLES: Record<string, string> = {
  FREE: "border-transparent bg-slate-500/15 text-slate-300",
  STUDENT: "border-transparent bg-sky-500/15 text-sky-300",
  PRO: "border-transparent bg-violet-500/15 text-violet-300",
  TEAM: "border-transparent bg-emerald-500/15 text-emerald-300",
};

export function PlanBadge({ plan, className }: { plan: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(PLAN_STYLES[plan] ?? PLAN_STYLES.FREE, className)}>
      {plan}
    </Badge>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "border-transparent bg-emerald-500/15 text-emerald-300",
  suspended: "border-transparent bg-amber-500/15 text-amber-300",
  banned: "border-transparent bg-rose-500/15 text-rose-300",
  archived: "border-transparent bg-slate-500/15 text-slate-300",
  deleted: "border-transparent bg-rose-500/15 text-rose-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status] ?? STATUS_STYLES.active, "capitalize", className)}>
      {status}
    </Badge>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  low: "border-transparent bg-slate-500/15 text-slate-300",
  medium: "border-transparent bg-sky-500/15 text-sky-300",
  high: "border-transparent bg-amber-500/15 text-amber-300",
  urgent: "border-transparent bg-rose-500/15 text-rose-300",
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium, "capitalize", className)}>
      {priority}
    </Badge>
  );
}

const TICKET_STATUS_STYLES: Record<string, string> = {
  open: "border-transparent bg-sky-500/15 text-sky-300",
  pending: "border-transparent bg-amber-500/15 text-amber-300",
  resolved: "border-transparent bg-emerald-500/15 text-emerald-300",
  closed: "border-transparent bg-slate-500/15 text-slate-300",
};

export function TicketStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(TICKET_STATUS_STYLES[status] ?? TICKET_STATUS_STYLES.open, "capitalize", className)}>
      {status}
    </Badge>
  );
}

const ANNOUNCEMENT_TYPE_STYLES: Record<string, string> = {
  info: "border-transparent bg-sky-500/15 text-sky-300",
  update: "border-transparent bg-violet-500/15 text-violet-300",
  maintenance: "border-transparent bg-amber-500/15 text-amber-300",
  release: "border-transparent bg-emerald-500/15 text-emerald-300",
};

export function AnnouncementTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(ANNOUNCEMENT_TYPE_STYLES[type] ?? ANNOUNCEMENT_TYPE_STYLES.info, "capitalize", className)}>
      {type}
    </Badge>
  );
}
