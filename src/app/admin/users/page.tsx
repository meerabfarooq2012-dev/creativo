"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users as UsersIcon,
  Search,
  MoreHorizontal,
  Pencil,
  Ban,
  Trash2,
  ShieldCheck,
  CreditCard,
  UserX,
  CheckCircle2,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { RoleBadge, PlanBadge, StatusBadge } from "@/components/admin/badges";
import { adminFetch, ApiError, buildQuery } from "@/lib/admin/api-client";
import type { AdminUser } from "@/lib/admin/types";
import { fmtMb, fmtRelative, fmtDate } from "@/lib/admin/format";

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: { total: number; active: number; suspended: number; banned: number };
}

const ROLES = [
  { value: "FREE_USER", label: "Free" },
  { value: "STUDENT", label: "Student" },
  { value: "PRO", label: "Pro" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];
const PLANS = [
  { value: "FREE", label: "Free" },
  { value: "STUDENT", label: "Student" },
  { value: "PRO", label: "Pro" },
  { value: "TEAM", label: "Team" },
];
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
];

function initials(name: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [banOpen, setBanOpen] = useState(false);
  const [banUser, setBanUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const query = buildQuery({
    search: debouncedSearch,
    role,
    status,
    plan,
    page,
    pageSize,
  });

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["admin", "users", { debouncedSearch, role, status, plan, page, pageSize }],
    queryFn: () => adminFetch<UsersResponse>(`/api/admin/users${query}`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const editMutation = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) =>
      adminFetch(`/api/admin/users/${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSuccess: () => {
      toast.success("User updated");
      setEditOpen(false);
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const changePlanMutation = useMutation({
    mutationFn: (vars: { id: string; plan: string }) =>
      adminFetch(`/api/admin/users/${vars.id}/plan`, { method: "POST", body: JSON.stringify({ plan }) }),
    onSuccess: () => {
      toast.success("Plan changed");
      setPlanOpen(false);
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const suspendMutation = useMutation({
    mutationFn: (vars: { id: string; reason: string }) =>
      adminFetch(`/api/admin/users/${vars.id}/suspend`, { method: "POST", body: JSON.stringify({ reason: vars.reason }) }),
    onSuccess: () => {
      toast.success("User suspended");
      setSuspendOpen(false);
      setSuspendReason("");
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const banMutation = useMutation({
    mutationFn: (vars: { id: string; reason: string }) =>
      adminFetch(`/api/admin/users/${vars.id}/ban`, { method: "POST", body: JSON.stringify({ reason: vars.reason }) }),
    onSuccess: () => {
      toast.success("User banned");
      setBanOpen(false);
      setBanReason("");
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/users/${id}/unban`, { method: "POST" }),
    onSuccess: () => {
      toast.success("User reactivated");
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User deleted");
      setDeleteOpen(false);
      invalidate();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const counts = data?.counts;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        description="Manage platform users, roles, plans, and account status."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={counts?.total ?? 0} icon={UsersIcon} accent="primary" />
        <StatCard label="Active" value={counts?.active ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard label="Suspended" value={counts?.suspended ?? 0} icon={UserX} accent="warning" />
        <StatCard label="Banned" value={counts?.banned ?? 0} icon={Ban} accent="danger" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <Select value={role || "ALL"} onValueChange={(v) => { setRole(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={plan || "ALL"} onValueChange={(v) => { setPlan(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="All plans" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All plans</SelectItem>
              {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status || "ALL"} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[200px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data && data.users.length > 0 ? (
                data.users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-accent/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={u.image || undefined} alt={u.name || "User"} />
                          <AvatarFallback className="bg-gradient-brand text-white text-xs">{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell><PlanBadge plan={u.plan} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtMb(u.storageUsedMb)} / <span className="text-xs">{fmtMb(u.storageLimitMb)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(u.lastLoginAt)}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setEditUser(u); setEditOpen(true); }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setPlanUser(u); setPlanOpen(true); }}>
                            <CreditCard className="size-4" /> Change Plan
                          </DropdownMenuItem>
                          {u.status === "active" && (
                            <DropdownMenuItem onClick={() => { setSuspendUser(u); setSuspendOpen(true); }}>
                              <UserX className="size-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {u.status !== "banned" ? (
                            <DropdownMenuItem onClick={() => { setBanUser(u); setBanOpen(true); }} className="text-rose-300 focus:text-rose-200">
                              <Ban className="size-4" /> Ban
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => unbanMutation.mutate(u.id)}>
                              <ShieldCheck className="size-4" /> Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setDeleteUser(u); setDeleteOpen(true); }} className="text-rose-300 focus:text-rose-200">
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState icon={Inbox} title="No users found" description="Try adjusting your search or filters." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(data.page - 1) * data.pageSize + 1}</span>
              {" "}–{" "}
              <span className="font-medium text-foreground">{Math.min(data.page * data.pageSize, data.total)}</span>
              {" "}of <span className="font-medium text-foreground">{data.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {data.page} / {data.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update name, role, plan, and status for {editUser?.email}</DialogDescription>
          </DialogHeader>
          {editUser && <EditUserForm
            user={editUser}
            onSubmit={(body) => editMutation.mutate({ id: editUser.id, body })}
            loading={editMutation.isPending}
          />}
        </DialogContent>
      </Dialog>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>Select a new plan for {planUser?.email}</DialogDescription>
          </DialogHeader>
          {planUser && (
            <div className="flex flex-col gap-3 py-2">
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map((p) => (
                  <Button
                    key={p.value}
                    variant={planUser.plan === p.value ? "default" : "outline"}
                    onClick={() => changePlanMutation.mutate({ id: planUser.id, plan: p.value })}
                    disabled={changePlanMutation.isPending || planUser.plan === p.value}
                  >
                    {planUser.plan === p.value ? `${p.label} (current)` : p.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend user</DialogTitle>
            <DialogDescription>{suspendUser?.email} will be unable to sign in until reactivated.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="suspend-reason">Reason (optional)</Label>
            <Textarea
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Suspicious activity — pending review"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={suspendMutation.isPending}
              onClick={() => suspendUser && suspendMutation.mutate({ id: suspendUser.id, reason: suspendReason })}
            >
              {suspendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban user</DialogTitle>
            <DialogDescription>{banUser?.email} will be permanently banned from signing in.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="ban-reason">Reason</Label>
            <Textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Repeated Terms of Service violations"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={banMutation.isPending}
              onClick={() => banUser && banMutation.mutate({ id: banUser.id, reason: banReason })}
            >
              {banMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Ban account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{deleteUser?.email}</span> and all their projects, assets, and data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditUserForm({ user, onSubmit, loading }: {
  user: AdminUser;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-plan">Plan</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger id="edit-plan"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button
          disabled={loading}
          onClick={() => onSubmit({ name, role, plan, status })}
        >
          {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
          Save changes
        </Button>
      </DialogFooter>
    </div>
  );
}
