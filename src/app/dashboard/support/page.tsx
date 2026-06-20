"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LifeBuoy,
  Plus,
  ArrowLeft,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  getTicketCategoryMeta,
  getTicketPriorityMeta,
  initials,
  timeAgo,
} from "@/lib/dashboard/constants";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: "Open", color: "#3B82F6", icon: Clock },
  pending: { label: "Pending", color: "#F59E0B", icon: Clock },
  resolved: { label: "Resolved", color: "#22C55E", icon: CheckCircle2 },
  closed: { label: "Closed", color: "#94A3B8", icon: XCircle },
};

export default function SupportPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support/tickets");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const tickets: any[] = listQuery.data?.tickets ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <LifeBuoy className="h-6 w-6 text-primary" />
            Support
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get help from our team. View your tickets or create a new one.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-gradient-brand text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No support tickets"
          description="Need help with something? Create a ticket and our team will get back to you."
          action={
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-brand">
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          }
        />
      ) : selectedId ? (
        <TicketDetail
          ticketId={selectedId}
          onBack={() => setSelectedId(null)}
          onReplySent={() => qc.invalidateQueries({ queryKey: ["tickets", selectedId] })}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const prio = getTicketPriorityMeta(t.priority);
            const cat = getTicketCategoryMeta(t.category);
            const status = STATUS_META[t.status] ?? STATUS_META.open;
            const StatusIcon = status.icon;
            return (
              <Card
                key={t.id}
                className="cursor-pointer p-4 transition-all hover:border-primary/40 hover:shadow-md"
                onClick={() => setSelectedId(t.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {t.ticketNo}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                        style={{ color: prio.color }}
                      >
                        {prio.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ color: status.color }}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold">{t.subject}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Created {timeAgo(t.createdAt)} · {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          qc.invalidateQueries({ queryKey: ["tickets"] });
          setCreateOpen(false);
          setSelectedId(id);
        }}
      />
    </div>
  );
}

function TicketDetail({
  ticketId,
  onBack,
  onReplySent,
}: {
  ticketId: string;
  onBack: () => void;
  onReplySent: () => void;
}) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/support/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const ticket = data?.ticket;
  const replies: any[] = ticket?.replies ?? [];

  const onSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Reply sent");
      setReply("");
      onReplySent();
      qc.invalidateQueries({ queryKey: ["tickets"] });
    } catch {
      toast.error("Could not send reply");
    } finally {
      setSending(false);
    }
  };

  const onCloseTicket = async () => {
    setClosing(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Ticket closed");
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["tickets", ticketId] });
    } catch {
      toast.error("Could not close ticket");
    } finally {
      setClosing(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!ticket) return <EmptyState icon={AlertCircle} title="Ticket not found" />;

  const prio = getTicketPriorityMeta(ticket.priority);
  const cat = getTicketCategoryMeta(ticket.category);
  const status = STATUS_META[ticket.status] ?? STATUS_META.open;
  const StatusIcon = status.icon;
  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to tickets
      </Button>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono">
            {ticket.ticketNo}
          </Badge>
          <Badge variant="secondary" className="text-[10px]" style={{ color: prio.color }}>
            {prio.label}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {cat.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]" style={{ color: status.color }}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          <span className="ml-auto text-[11px] text-muted-foreground">
            Created {timeAgo(ticket.createdAt)}
          </span>
        </div>
        <h2 className="text-lg font-semibold">{ticket.subject}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{ticket.description}</p>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">
          Replies ({replies.length})
        </h3>
        {replies.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No replies yet. Be the first to respond.
          </p>
        ) : (
          replies.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="mb-1 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={r.user?.image ?? undefined} alt={r.user?.name ?? ""} />
                  <AvatarFallback className="bg-gradient-brand text-[10px] text-white">
                    {initials(r.user?.name ?? r.user?.email ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{r.user?.name ?? "You"}</span>
                {r.isStaff && (
                  <Badge variant="secondary" className="text-[10px]">
                    Staff
                  </Badge>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {timeAgo(r.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground">{r.message}</p>
            </Card>
          ))
        )}
      </div>

      {!isClosed && (
        <Card className="p-3">
          <Label htmlFor="reply" className="text-xs">
            Reply
          </Label>
          <Textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message…"
            className="mt-1 min-h-24"
            disabled={sending}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCloseTicket}
              disabled={closing}
            >
              <XCircle className="mr-2 h-3.5 w-3.5" />
              {closing ? "Closing…" : "Close ticket"}
            </Button>
            <Button
              size="sm"
              onClick={onSendReply}
              disabled={sending || !reply.trim()}
              className="bg-gradient-brand"
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send reply"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function CreateTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setSubject("");
    setDescription("");
    setCategory("general");
    setPriority("medium");
  };

  const onCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category,
          priority,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      const { ticket } = await res.json();
      toast.success("Ticket created", {
        description: `Your ticket ${ticket.ticketNo} has been submitted.`,
      });
      reset();
      onCreated(ticket.id);
    } catch (e: any) {
      toast.error(e.message ?? "Could not create ticket");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New support ticket</DialogTitle>
          <DialogDescription>
            Tell us what you need help with and we&apos;ll get back to you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe the issue"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible…"
              className="min-h-32"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={busy || !subject.trim() || !description.trim()}
            className="bg-gradient-brand"
          >
            {busy ? "Submitting…" : "Submit ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
