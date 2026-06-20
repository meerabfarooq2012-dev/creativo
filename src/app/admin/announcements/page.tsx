"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Bell,
  Loader2,
  Inbox,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { AnnouncementTypeBadge } from "@/components/admin/badges";
import { adminFetch, ApiError } from "@/lib/admin/api-client";
import type { AdminAnnouncement } from "@/lib/admin/types";
import { fmtDateTime, fmtRelative } from "@/lib/admin/format";

interface AnnouncementsResponse { announcements: AdminAnnouncement[] }

const TYPES = [
  { value: "info", label: "Info" },
  { value: "update", label: "Update" },
  { value: "maintenance", label: "Maintenance" },
  { value: "release", label: "Release" },
];
const AUDIENCES = [
  { value: "all", label: "All users" },
  { value: "free", label: "Free users" },
  { value: "pro", label: "Pro / Team" },
  { value: "admin", label: "Admins only" },
];

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<AnnouncementsResponse>({
    queryKey: ["admin", "announcements"],
    queryFn: () => adminFetch<AnnouncementsResponse>("/api/admin/announcements"),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminAnnouncement | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminAnnouncement | null>(null);
  const [notifyItem, setNotifyItem] = useState<AdminAnnouncement | null>(null);

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => adminFetch("/api/admin/announcements", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Announcement created");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) => adminFetch(`/api/admin/announcements/${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSuccess: () => {
      toast.success("Announcement updated");
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Announcement deleted");
      setDeleteItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const notifyMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/announcements/${id}/notify`, { method: "POST" }),
    onSuccess: (data: { recipients: number }) => {
      toast.success(`Notification sent to ${data.recipients} user${data.recipients === 1 ? "" : "s"}`);
      setNotifyItem(null);
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Announcements"
        description="Publish platform-wide announcements and send notifications."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Create Announcement
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[240px]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.announcements.length > 0 ? (
                data.announcements.map((a) => (
                  <TableRow key={a.id} className="hover:bg-accent/30">
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      {a.summary && <p className="text-xs text-muted-foreground truncate">{a.summary}</p>}
                    </TableCell>
                    <TableCell><AnnouncementTypeBadge type={a.type} /></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{a.audience}</Badge></TableCell>
                    <TableCell>
                      {a.isPublished ? (
                        <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-300">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="border-transparent bg-slate-500/15 text-slate-300">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.isPinned ? <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-300"><Pin className="size-3 mr-1" />Pinned</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(a.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Actions"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditItem(a)}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, body: { isPublished: !a.isPublished } })}>
                            {a.isPublished ? <><EyeOff className="size-4" /> Unpublish</> : <><Eye className="size-4" /> Publish</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, body: { isPinned: !a.isPinned } })}>
                            {a.isPinned ? <><PinOff className="size-4" /> Unpin</> : <><Pin className="size-4" /> Pin</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNotifyItem(a)} disabled={!a.isPublished}>
                            <Bell className="size-4" /> Send notification
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteItem(a)} className="text-rose-300 focus:text-rose-200">
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7}><EmptyState icon={Inbox} title="No announcements" description="Create your first announcement." action={<Button onClick={() => setCreateOpen(true)}><Plus className="size-4" /> Create</Button>} /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AnnouncementFormDialog
        key={`create-${createOpen}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create announcement"
        description="Compose a new platform announcement."
        onSubmit={(body) => createMutation.mutate(body)}
        loading={createMutation.isPending}
      />
      <AnnouncementFormDialog
        key={`edit-${editItem?.id ?? 'none'}`}
        open={!!editItem}
        onOpenChange={(o) => !o && setEditItem(null)}
        title="Edit announcement"
        description="Update announcement content and settings."
        announcement={editItem || undefined}
        onSubmit={(body) => editItem && updateMutation.mutate({ id: editItem.id, body })}
        loading={updateMutation.isPending}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteItem?.title}</span> will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!notifyItem} onOpenChange={(o) => !o && setNotifyItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send notification to users?</AlertDialogTitle>
            <AlertDialogDescription>
              A notification will be created for every user in the <span className="font-medium text-foreground">{notifyItem?.audience}</span> audience.
              {notifyItem && <span className="block mt-1 text-xs">Last updated: {fmtDateTime(notifyItem.publishedAt || notifyItem.createdAt)}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={notifyMutation.isPending}
              onClick={() => notifyItem && notifyMutation.mutate(notifyItem.id)}
            >
              {notifyMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <Bell className="size-4 mr-1" />}
              Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnnouncementFormDialog({
  open,
  onOpenChange,
  title,
  description,
  announcement,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  announcement?: AdminAnnouncement;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [titleText, setTitleText] = useState(announcement?.title || "");
  const [summary, setSummary] = useState(announcement?.summary || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [type, setType] = useState(announcement?.type || "info");
  const [audience, setAudience] = useState(announcement?.audience || "all");
  const [publishNow, setPublishNow] = useState(announcement?.isPublished ?? false);
  const [pin, setPin] = useState(announcement?.isPinned ?? false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="an-title">Title</Label>
            <Input id="an-title" value={titleText} onChange={(e) => setTitleText(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="an-summary">Summary (optional)</Label>
            <Input id="an-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line summary" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="an-content">Content</Label>
            <Textarea id="an-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="an-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="an-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="an-audience">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="an-audience"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="an-publish" checked={publishNow} onCheckedChange={setPublishNow} />
              <Label htmlFor="an-publish">Publish now</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="an-pin" checked={pin} onCheckedChange={setPin} />
              <Label htmlFor="an-pin">Pin to top</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={loading || !titleText || !content}
            onClick={() => onSubmit({ title: titleText, summary, content, type, audience, publishNow, pin })}
          >
            {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
