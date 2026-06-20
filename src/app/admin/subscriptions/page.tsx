"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Inbox,
  CalendarClock,
  Ban as BanIcon,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/badges";
import { adminFetch, ApiError } from "@/lib/admin/api-client";
import type { AdminPlan, AdminSubscription } from "@/lib/admin/types";
import { fmtCurrency, fmtDate, fmtRelative, fmtMb } from "@/lib/admin/format";

interface PlansResponse { plans: AdminPlan[] }
interface SubsResponse {
  subscriptions: AdminSubscription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: { total: number; active: number; trialing: number; canceled: number; mrr: number };
}
interface TrialsResponse {
  trials: Array<{
    userId: string;
    trialActive: boolean;
    trialStartedAt: string | null;
    trialEndsAt: string | null;
    plan: string;
    user: { id: string; name: string | null; email: string; status: string };
  }>;
}

const PLANS = ["FREE", "STUDENT", "PRO", "TEAM"];

export default function AdminSubscriptionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subscriptions"
        description="Manage plans, view user subscriptions, and oversee free trials."
      />
      <Tabs defaultValue="plans" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="trials">Free Trials</TabsTrigger>
        </TabsList>
        <TabsContent value="plans"><PlansTab /></TabsContent>
        <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
        <TabsContent value="trials"><TrialsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function PlansTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<PlansResponse>({
    queryKey: ["admin", "plans"],
    queryFn: () => adminFetch<PlansResponse>("/api/admin/plans"),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<AdminPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<AdminPlan | null>(null);

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => adminFetch("/api/admin/plans", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Plan created");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) => adminFetch(`/api/admin/plans/${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSuccess: () => {
      toast.success("Plan updated");
      setEditPlan(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Plan deleted");
      setDeletePlan(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Create Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : data && data.plans.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.plans.map((p) => (
            <Card key={p.id} className="relative flex flex-col p-5">
              {p.isPopular && (
                <Badge className="absolute -top-2 left-4 bg-gradient-brand text-white border-transparent">
                  <Sparkles className="size-3 mr-1" /> Popular
                </Badge>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{p.displayName}</h3>
                  <p className="text-xs text-muted-foreground">{p.name}</p>
                </div>
                <Switch
                  checked={p.isActive}
                  onCheckedChange={(v) => editMutation.mutate({ id: p.id, body: { isActive: v } })}
                  aria-label="Toggle plan active"
                />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground">{fmtCurrency(p.priceMonthly)}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {fmtCurrency(p.priceYearly)} / year · {fmtMb(p.storageLimitMb)} storage
              </p>
              {p.description && <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>}
              <ul className="mt-3 flex-1 space-y-1.5">
                {p.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
                {p.features.length > 4 && <li className="text-xs text-muted-foreground">+{p.features.length - 4} more</li>}
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditPlan(p)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                {p.name !== "FREE" && (
                  <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200" onClick={() => setDeletePlan(p)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <EmptyState icon={Inbox} title="No plans configured" description="Create your first subscription plan." />
        </Card>
      )}

      <PlanFormDialog
        key={`create-${createOpen}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create plan"
        description="Add a new subscription plan."
        onSubmit={(body) => createMutation.mutate(body)}
        loading={createMutation.isPending}
      />
      <PlanFormDialog
        key={`edit-${editPlan?.id ?? 'none'}`}
        open={!!editPlan}
        onOpenChange={(o) => !o && setEditPlan(null)}
        title="Edit plan"
        description="Update plan details."
        plan={editPlan || undefined}
        onSubmit={(body) => editPlan && editMutation.mutate({ id: editPlan.id, body })}
        loading={editMutation.isPending}
      />

      <AlertDialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Users on the <span className="font-medium text-foreground">{deletePlan?.displayName}</span> plan will be moved back to Free. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deletePlan && deleteMutation.mutate(deletePlan.id)}
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

function PlanFormDialog({
  open,
  onOpenChange,
  title,
  description,
  plan,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  plan?: AdminPlan;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(plan?.name || "");
  const [displayName, setDisplayName] = useState(plan?.displayName || "");
  const [descriptionText, setDescriptionText] = useState(plan?.description || "");
  const [priceMonthly, setPriceMonthly] = useState(plan?.priceMonthly ?? 0);
  const [priceYearly, setPriceYearly] = useState(plan?.priceYearly ?? 0);
  const [storageLimitMb, setStorageLimitMb] = useState(plan?.storageLimitMb ?? 500);
  const [features, setFeatures] = useState((plan?.features || []).join("\n"));
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [isPopular, setIsPopular] = useState(plan?.isPopular ?? false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-name">Name (key)</Label>
              <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="PRO" disabled={!!plan} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-display">Display Name</Label>
              <Input id="plan-display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Pro" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-desc">Description</Label>
            <Input id="plan-desc" value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-pm">Monthly $</Label>
              <Input id="plan-pm" type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-py">Yearly $</Label>
              <Input id="plan-py" type="number" value={priceYearly} onChange={(e) => setPriceYearly(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-sl">Storage MB</Label>
              <Input id="plan-sl" type="number" value={storageLimitMb} onChange={(e) => setStorageLimitMb(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-feats">Features (one per line)</Label>
            <Textarea id="plan-feats" value={features} onChange={(e) => setFeatures(e.target.value)} rows={5} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="plan-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="plan-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="plan-popular" checked={isPopular} onCheckedChange={setIsPopular} />
              <Label htmlFor="plan-popular">Popular</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={loading || !name || !displayName}
            onClick={() => onSubmit({
              name,
              displayName,
              description: descriptionText,
              priceMonthly,
              priceYearly,
              storageLimitMb,
              features: features.split("\n").map((f) => f.trim()).filter(Boolean),
              isActive,
              isPopular,
            })}
          >
            {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionsTab() {
  const { data, isLoading } = useQuery<SubsResponse>({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => adminFetch<SubsResponse>("/api/admin/subscriptions?pageSize=50"),
  });

  const stats = data?.stats;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats?.total ?? 0} icon={CreditCard} accent="primary" />
        <StatCard label="Active" value={stats?.active ?? 0} icon={TrendingUp} accent="success" />
        <StatCard label="Trialing" value={stats?.trialing ?? 0} icon={CalendarClock} accent="warning" />
        <StatCard label="MRR" value={fmtCurrency(stats?.mrr ?? 0)} icon={TrendingUp} accent="secondary" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[180px]">User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Trial ends</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.subscriptions.length > 0 ? (
                data.subscriptions.map((s) => (
                  <TableRow key={s.id} className="hover:bg-accent/30">
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate">{s.user.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{s.plan}</Badge></TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(s.startedAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(s.endsAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(s.trialEndsAt)}</TableCell>
                    <TableCell className="text-sm text-foreground">{fmtCurrency(s.amount)} <span className="text-xs text-muted-foreground">/{s.interval || "mo"}</span></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7}><EmptyState icon={Inbox} title="No subscriptions" /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function TrialsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<TrialsResponse>({
    queryKey: ["admin", "trials"],
    queryFn: () => adminFetch<TrialsResponse>("/api/admin/trials"),
  });

  const extendMutation = useMutation({
    mutationFn: (userId: string) => adminFetch(`/api/admin/trials/${userId}/extend`, { method: "POST", body: JSON.stringify({ days: 7 }) }),
    onSuccess: () => {
      toast.success("Trial extended by 7 days");
      queryClient.invalidateQueries({ queryKey: ["admin", "trials"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const disableMutation = useMutation({
    mutationFn: (userId: string) => adminFetch(`/api/admin/trials/${userId}/disable`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Trial disabled");
      queryClient.invalidateQueries({ queryKey: ["admin", "trials"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Active Free Trials</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Extend or disable trial access for users.</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[180px]">User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))
            ) : data && data.trials.length > 0 ? (
              data.trials.map((t) => {
                const ended = t.trialEndsAt && new Date(t.trialEndsAt) < new Date();
                return (
                  <TableRow key={t.userId} className="hover:bg-accent/30">
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate">{t.user.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.plan}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(t.trialStartedAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(t.trialEndsAt)}</TableCell>
                    <TableCell>
                      {ended ? <Badge variant="outline" className="border-transparent bg-rose-500/15 text-rose-300">Expired</Badge>
                        : <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-300">Active</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={extendMutation.isPending}
                          onClick={() => extendMutation.mutate(t.userId)}
                        >
                          <CalendarClock className="size-3.5" /> +7 days
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-200"
                          disabled={disableMutation.isPending}
                          onClick={() => disableMutation.mutate(t.userId)}
                        >
                          <BanIcon className="size-3.5" /> Disable
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow><TableCell colSpan={6}><EmptyState icon={Inbox} title="No active trials" /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
