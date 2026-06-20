"use client";

import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck,
  Activity,
  ScrollText,
  Lock,
  Check,
  X,
  Loader2,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { RoleBadge } from "@/components/admin/badges";
import { adminFetch, ApiError, buildQuery } from "@/lib/admin/api-client";
import type { PermissionsMatrix } from "@/lib/admin/types";
import { fmtDateTime, fmtRelative } from "@/lib/admin/format";

interface LogsResponse {
  securityLogs: Array<{
    id: string;
    event: string;
    ip: string | null;
    location: string | null;
    createdAt: string;
    user: { id: string; name: string | null; email: string } | null;
  }>;
  securityTotal: number;
  activityLogs: Array<{
    id: string;
    action: string;
    category: string;
    entity: string | null;
    entityId: string | null;
    ip: string | null;
    createdAt: string;
    user: { id: string; name: string | null; email: string } | null;
  }>;
  activityTotal: number;
  eventTypes: Array<{ event: string; count: number }>;
  page: number;
  pageSize: number;
}
interface AdminLogsResponse {
  adminLogs: Array<{
    id: string;
    action: string;
    targetUserId: string | null;
    targetEntity: string | null;
    targetEntityId: string | null;
    details: string | null;
    createdAt: string;
    admin: { id: string; name: string | null; email: string } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  bannedAccounts: Array<{
    id: string;
    name: string | null;
    email: string;
    status: string;
    bannedReason: string | null;
    bannedAt: string | null;
    role: string;
    plan: string;
  }>;
}

const EVENT_COLORS: Record<string, string> = {
  login_success: "border-transparent bg-emerald-500/15 text-emerald-300",
  login_failed: "border-transparent bg-rose-500/15 text-rose-300",
  logout: "border-transparent bg-slate-500/15 text-slate-300",
  password_change: "border-transparent bg-sky-500/15 text-sky-300",
  email_verify: "border-transparent bg-sky-500/15 text-sky-300",
  role_change: "border-transparent bg-amber-500/15 text-amber-300",
  ban: "border-transparent bg-rose-500/15 text-rose-300",
  suspend: "border-transparent bg-amber-500/15 text-amber-300",
};

export default function AdminSecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Security Center"
        description="Audit login & activity logs, manage blocked accounts, and review admin actions."
        actions={
          <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300">
            <ShieldAlert className="size-3 mr-1" /> Restricted area
          </Badge>
        }
      />
      <Tabs defaultValue="logs" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="logs"><Activity className="size-4 mr-1.5" /> Logs</TabsTrigger>
          <TabsTrigger value="banned"><Lock className="size-4 mr-1.5" /> Blocked Accounts</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="size-4 mr-1.5" /> Admin Audit</TabsTrigger>
          <TabsTrigger value="permissions"><ShieldCheck className="size-4 mr-1.5" /> Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="logs"><LogsTab /></TabsContent>
        <TabsContent value="banned"><BannedTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
        <TabsContent value="permissions"><PermissionsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function LogsTab() {
  const [event, setEvent] = useState("");
  const [category, setCategory] = useState("");
  const query = buildQuery({ event, category, pageSize: 50 });
  const { data, isLoading } = useQuery<LogsResponse>({
    queryKey: ["admin", "security", "logs", { event, category }],
    queryFn: () => adminFetch<LogsResponse>(`/api/admin/security/logs${query}`),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Security Events" value={data?.securityTotal ?? 0} icon={ShieldCheck} accent="primary" />
        <StatCard label="Activity Logs" value={data?.activityTotal ?? 0} icon={Activity} accent="secondary" />
        <StatCard label="Event Types" value={data?.eventTypes.length ?? 0} icon={ScrollText} accent="success" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={event || "ALL"} onValueChange={(v) => setEvent(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="All security events" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All security events</SelectItem>
              {data?.eventTypes.map((e) => <SelectItem key={e.event} value={e.event}>{e.event} ({e.count})</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category || "ALL"} onValueChange={(v) => setCategory(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All activity categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Security Logs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Logins, bans, suspensions, password changes</p>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-9 w-full" /></TableCell></TableRow>
                  ))
                ) : data && data.securityLogs.length > 0 ? (
                  data.securityLogs.map((s) => (
                    <TableRow key={s.id} className="hover:bg-accent/30">
                      <TableCell>
                        <p className="text-sm text-foreground truncate max-w-[160px]">{s.user?.name || s.user?.email || "system"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${EVENT_COLORS[s.event] || "border-transparent bg-slate-500/15 text-slate-300"}`}>{s.event.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{s.ip || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtRelative(s.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4}><EmptyState icon={Inbox} title="No security events" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Activity Logs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">User actions across the platform</p>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-9 w-full" /></TableCell></TableRow>
                  ))
                ) : data && data.activityLogs.length > 0 ? (
                  data.activityLogs.map((a) => (
                    <TableRow key={a.id} className="hover:bg-accent/30">
                      <TableCell>
                        <p className="text-sm text-foreground truncate max-w-[150px]">{a.user?.name || a.user?.email || "system"}</p>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{a.action}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{a.category}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtRelative(a.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4}><EmptyState icon={Inbox} title="No activity logs" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BannedTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<AdminLogsResponse>({
    queryKey: ["admin", "security", "admin-logs"],
    queryFn: () => adminFetch<AdminLogsResponse>("/api/admin/security/admin-logs?pageSize=10"),
  });

  const [unblock, setUnblock] = useState<{ id: string; name: string | null; email: string } | null>(null);

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/security/users/${id}/unblock`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Account unblocked");
      setUnblock(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "security", "admin-logs"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Blocked & Suspended Accounts</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Accounts that have been suspended or banned. Unblock to reactivate.</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[180px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Banned at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))
            ) : data && data.bannedAccounts.length > 0 ? (
              data.bannedAccounts.map((u) => (
                <TableRow key={u.id} className="hover:bg-accent/30">
                  <TableCell>
                    <p className="text-sm font-medium text-foreground truncate">{u.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.status === "banned" ? "border-transparent bg-rose-500/15 text-rose-300 capitalize" : "border-transparent bg-amber-500/15 text-amber-300 capitalize"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{u.bannedReason || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.bannedAt ? fmtRelative(u.bannedAt) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setUnblock({ id: u.id, name: u.name, email: u.email })}>
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6}><EmptyState icon={Check} title="No blocked accounts" description="All users are in good standing." /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!unblock} onOpenChange={(o) => !o && setUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock account?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{unblock?.name || unblock?.email}</span> will be reactivated and able to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={unblockMutation.isPending}
              onClick={() => unblock && unblockMutation.mutate(unblock.id)}
            >
              {unblockMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function AuditTab() {
  const { data, isLoading } = useQuery<AdminLogsResponse>({
    queryKey: ["admin", "security", "audit"],
    queryFn: () => adminFetch<AdminLogsResponse>("/api/admin/security/admin-logs?pageSize=50"),
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Admin Audit Log</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Every administrative action is logged for accountability.</p>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))
            ) : data && data.adminLogs.length > 0 ? (
              data.adminLogs.map((l) => (
                <TableRow key={l.id} className="hover:bg-accent/30">
                  <TableCell>
                    <p className="text-sm text-foreground truncate max-w-[160px]">{l.admin?.name || l.admin?.email || "system"}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{l.action}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.targetEntity ? `${l.targetEntity}${l.targetEntityId ? ` · ${l.targetEntityId.slice(-6)}` : ""}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[280px]">{l.details || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDateTime(l.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5}><EmptyState icon={Inbox} title="No admin actions logged yet" /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function PermissionsTab() {
  const { data, isLoading } = useQuery<PermissionsMatrix>({
    queryKey: ["admin", "permissions"],
    queryFn: () => adminFetch<PermissionsMatrix>("/api/admin/permissions"),
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Role Permissions Matrix</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Read-only view of permissions granted to each role.</p>
        </div>
        {data && (
          <Badge variant="outline" className={data.canManage ? "border-transparent bg-fuchsia-500/15 text-fuchsia-300" : "border-transparent bg-slate-500/15 text-slate-300"}>
            {data.canManage ? "Super Admin — full control" : "Admin — read only"}
          </Badge>
        )}
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4"><Skeleton className="h-64 w-full" /></div>
        ) : data ? (
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="sticky left-0 bg-card z-20 min-w-[160px]">Permission</TableHead>
                {data.roles.map((r) => (
                  <TableHead key={r.id} className="text-center min-w-[100px]">{r.displayName}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.permissionKeys.map((group) => (
                <Fragment key={`group-${group.group}`}>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={data.roles.length + 1} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.group}
                    </TableCell>
                  </TableRow>
                  {group.permissions.map((p) => (
                    <TableRow key={p.key} className="hover:bg-accent/30">
                      <TableCell className="sticky left-0 bg-card z-10 text-sm">{p.label}</TableCell>
                      {data.roles.map((r) => {
                        const has = r.permissions.includes(p.key);
                        return (
                          <TableCell key={r.id} className="text-center">
                            {has ? (
                              <Check className="size-4 text-emerald-400 inline" />
                            ) : (
                              <X className="size-4 text-slate-600 inline" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState icon={ShieldCheck} title="No permissions data" />
        )}
      </div>
      {!data?.canManage && data && (
        <div className="border-t border-border p-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldAlert className="size-3.5" />
          Editing permissions requires Super Admin role.
        </div>
      )}
    </Card>
  );
}
