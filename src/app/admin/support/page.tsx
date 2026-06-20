"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LifeBuoy,
  Search,
  Eye,
  Send,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { PriorityBadge, TicketStatusBadge } from "@/components/admin/badges";
import { adminFetch, ApiError, buildQuery } from "@/lib/admin/api-client";
import type { AdminTicket } from "@/lib/admin/types";
import { fmtDateTime, fmtRelative } from "@/lib/admin/format";

interface TicketsListResponse {
  tickets: Array<Omit<AdminTicket, "description" | "replies">>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: { total: number; open: number; pending: number; resolved: number; closed: number };
  assignees: Array<{ id: string; name: string | null; email: string }>;
}
interface TicketDetailResponse { ticket: AdminTicket }

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
  { value: "account", label: "Account" },
  { value: "bug", label: "Bug" },
];
const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const STATUSES = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function initials(name: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [viewTicketId, setViewTicketId] = useState<string | null>(null);

  const query = buildQuery({ search, status, category, priority, page, pageSize });
  const { data, isLoading } = useQuery<TicketsListResponse>({
    queryKey: ["admin", "tickets", { search, status, category, priority, page, pageSize }],
    queryFn: () => adminFetch<TicketsListResponse>(`/api/admin/tickets${query}`),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Support Tickets"
        description="Triage, assign, and resolve support tickets across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open" value={data?.stats.open ?? 0} icon={LifeBuoy} accent="secondary" />
        <StatCard label="Pending" value={data?.stats.pending ?? 0} icon={Inbox} accent="warning" />
        <StatCard label="Resolved" value={data?.stats.resolved ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard label="Closed" value={data?.stats.closed ?? 0} icon={XCircle} accent="primary" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by subject or ticket no…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Search tickets"
            />
          </div>
          <Select value={status || "ALL"} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category || "ALL"} onValueChange={(v) => { setCategory(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority || "ALL"} onValueChange={(v) => { setPriority(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[120px]">Ticket</TableHead>
                <TableHead className="min-w-[200px]">Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.tickets.length > 0 ? (
                data.tickets.map((t) => (
                  <TableRow key={t.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => setViewTicketId(t.id)}>
                    <TableCell><span className="font-mono text-xs text-muted-foreground">{t.ticketNo}</span></TableCell>
                    <TableCell className="text-sm font-medium text-foreground truncate max-w-xs">{t.subject}</TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground truncate">{t.user.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.category}</Badge></TableCell>
                    <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                    <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.assignee?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(t.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="View" onClick={(e) => { e.stopPropagation(); setViewTicketId(t.id); }}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={9}><EmptyState icon={Inbox} title="No tickets found" /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground">Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {data.page} / {data.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <TicketDetailDialog
        ticketId={viewTicketId}
        onClose={() => setViewTicketId(null)}
        assignees={data?.assignees || []}
        onMutated={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
        }}
      />
    </div>
  );
}

function TicketDetailDialog({
  ticketId,
  onClose,
  assignees,
  onMutated,
}: {
  ticketId: string | null;
  onClose: () => void;
  assignees: Array<{ id: string; name: string | null; email: string }>;
  onMutated: () => void;
}) {
  const open = !!ticketId;
  const { data, isLoading } = useQuery<TicketDetailResponse>({
    queryKey: ["admin", "ticket", ticketId],
    queryFn: () => adminFetch<TicketDetailResponse>(`/api/admin/tickets/${ticketId}`),
    enabled: !!ticketId,
  });

  const ticket = data?.ticket;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{ticket?.ticketNo}</span>
            <span>{ticket?.subject}</span>
          </DialogTitle>
          <DialogDescription>
            Opened by {ticket?.user.name || ticket?.user.email} · {ticket ? fmtDateTime(ticket.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : ticket ? (
          <TicketDetailBody
            key={ticket.id}
            ticket={ticket}
            assignees={assignees}
            onMutated={onMutated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TicketDetailBody({
  ticket,
  assignees,
  onMutated,
}: {
  ticket: AdminTicket;
  assignees: Array<{ id: string; name: string | null; email: string }>;
  onMutated: () => void;
}) {
  const [reply, setReply] = useState("");
  const [assignee, setAssignee] = useState(ticket.assignee?.id || "UNASSIGNED");
  const [status, setStatus] = useState(ticket.status);

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      adminFetch(`/api/admin/tickets/${id}/reply`, { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: () => {
      toast.success("Reply sent");
      setReply("");
      onMutated();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      adminFetch(`/api/admin/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Ticket updated");
      onMutated();
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
        <PriorityBadge priority={ticket.priority} />
        <TicketStatusBadge status={ticket.status} />
      </div>

      <Card className="p-3 bg-muted/40 border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">Original message</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description}</p>
      </Card>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Replies ({ticket.replies.length})</p>
        <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
          {ticket.replies.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No replies yet.</p>
          ) : (
            ticket.replies.map((r) => (
              <div key={r.id} className={`flex gap-2 ${r.isStaff ? "flex-row-reverse" : ""}`}>
                <Avatar className="size-7 mt-0.5">
                  <AvatarFallback className={r.isStaff ? "bg-gradient-brand text-white text-[10px]" : "bg-muted text-foreground text-[10px]"}>
                    {initials(r.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] rounded-md p-2.5 ${r.isStaff ? "bg-primary/15 text-foreground" : "bg-muted/60 text-foreground"}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium">{r.user.name || r.user.email}</span>
                    {r.isStaff && <Badge className="text-[9px] px-1 py-0 bg-gradient-brand text-white border-transparent">Staff</Badge>}
                    <span className="text-[10px] text-muted-foreground">{fmtRelative(r.createdAt)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reply">Reply as staff</Label>
        <Textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Type your reply…" />
        <Button
          size="sm"
          className="self-end"
          disabled={!reply.trim() || replyMutation.isPending}
          onClick={() => replyMutation.mutate({ id: ticket.id, message: reply.trim() })}
        >
          {replyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Send reply
        </Button>
      </div>

      <div className="border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status" className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignee" className="text-xs">Assignee</Label>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger id="assignee"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {assignees.map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate({
              id: ticket.id,
              body: {
                status,
                assignedTo: assignee === "UNASSIGNED" ? null : assignee,
              },
            })}
          >
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}
