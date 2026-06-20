"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderKanban,
  Search,
  Eye,
  Trash2,
  RotateCcw,
  Loader2,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { adminFetch, ApiError, buildQuery } from "@/lib/admin/api-client";
import type { AdminProject } from "@/lib/admin/types";
import { fmtBytes, fmtDate, fmtRelative } from "@/lib/admin/format";

interface ProjectsResponse {
  projects: AdminProject[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const TYPES = [
  { value: "design", label: "Design" },
  { value: "illustration", label: "Illustration" },
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "animation", label: "Animation" },
];

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [viewProject, setViewProject] = useState<AdminProject | null>(null);
  const [deleteProject, setDeleteProject] = useState<AdminProject | null>(null);
  const [permanentProject, setPermanentProject] = useState<AdminProject | null>(null);

  const query = buildQuery({ search, type, includeDeleted, page, pageSize });

  const { data, isLoading } = useQuery<ProjectsResponse>({
    queryKey: ["admin", "projects", { search, type, includeDeleted, page, pageSize }],
    queryFn: () => adminFetch<ProjectsResponse>(`/api/admin/projects${query}`),
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Project moved to trash");
      setDeleteProject(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/projects/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Project restored");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const permanentMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/projects/${id}/permanent`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Project permanently deleted");
      setPermanentProject(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Project Management"
        description="Browse, moderate, and manage all user projects across the platform."
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Search projects"
            />
          </div>
          <Select value={type || "ALL"} onValueChange={(v) => { setType(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 px-2">
            <Switch id="show-deleted" checked={includeDeleted} onCheckedChange={(v) => { setIncludeDeleted(v); setPage(1); }} />
            <Label htmlFor="show-deleted" className="text-sm cursor-pointer">Show deleted</Label>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[200px]">Project</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last opened</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.projects.length > 0 ? (
                data.projects.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded bg-muted text-muted-foreground">
                          <FolderKanban className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          {p.isDeleted && <Badge variant="outline" className="border-transparent bg-rose-500/15 text-rose-300 mt-0.5">Deleted</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground truncate">{p.user.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.type}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtBytes(p.sizeBytes)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtRelative(p.lastOpenedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Actions"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewProject(p)}>
                            <Eye className="size-4" /> View
                          </DropdownMenuItem>
                          {p.isDeleted ? (
                            <>
                              <DropdownMenuItem onClick={() => restoreMutation.mutate(p.id)}>
                                <RotateCcw className="size-4" /> Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPermanentProject(p)} className="text-rose-300 focus:text-rose-200">
                                <Trash2 className="size-4" /> Permanent delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => setDeleteProject(p)} className="text-rose-300 focus:text-rose-200">
                              <Trash2 className="size-4" /> Soft delete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8}><EmptyState icon={Inbox} title="No projects found" /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground">
              Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {data.page} / {data.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!viewProject} onOpenChange={(o) => !o && setViewProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewProject?.name}</DialogTitle>
            <DialogDescription>Read-only project view (admin)</DialogDescription>
          </DialogHeader>
          {viewProject && (
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><span className="text-muted-foreground">Owner:</span> <span className="text-foreground">{viewProject.user.name || viewProject.user.email}</span></div>
              <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground capitalize">{viewProject.type}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="text-foreground capitalize">{viewProject.status}</span></div>
              <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{fmtBytes(viewProject.sizeBytes)}</span></div>
              <div><span className="text-muted-foreground">Created:</span> <span className="text-foreground">{fmtDate(viewProject.createdAt)}</span></div>
              <div><span className="text-muted-foreground">Last opened:</span> <span className="text-foreground">{fmtRelative(viewProject.lastOpenedAt)}</span></div>
              {viewProject.isDeleted && (
                <div className="col-span-2 mt-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-start gap-2">
                  <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                  <span>This project has been soft-deleted and is hidden from the owner. Restore it to return it to active state.</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProject} onOpenChange={(o) => !o && setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move project to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteProject?.name}</span> will be hidden from the owner and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-500 text-white hover:bg-amber-600"
              disabled={softDeleteMutation.isPending}
              onClick={() => deleteProject && softDeleteMutation.mutate(deleteProject.id)}
            >
              {softDeleteMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Soft delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!permanentProject} onOpenChange={(o) => !o && setPermanentProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{permanentProject?.name}</span> and all its data will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={permanentMutation.isPending}
              onClick={() => permanentProject && permanentMutation.mutate(permanentProject.id)}
            >
              {permanentMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Permanently delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
