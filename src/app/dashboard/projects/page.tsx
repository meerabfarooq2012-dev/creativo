"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  FolderKanban,
  FolderPlus,
  Folder,
  Star,
  Trash2,
  Pencil,
  Archive,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PROJECT_TYPES } from "@/lib/dashboard/constants";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <ProjectsPageInner />
    </Suspense>
  );
}

function ProjectsPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();

  const [search, setSearch] = useState(sp.get("search") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "all");
  const [status, setStatus] = useState(sp.get("status") ?? "active");
  const [favoritesOnly, setFavoritesOnly] = useState(sp.get("favorite") === "true");
  const [folderFilter, setFolderFilter] = useState<string>(sp.get("folderId") ?? "all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [createOpen, setCreateOpen] = useState(false);
  const [folderCreateOpen, setFolderCreateOpen] = useState(false);
  const [folderRename, setFolderRename] = useState<{ id: string; name: string } | null>(null);
  const [folderDelete, setFolderDelete] = useState<{ id: string; name: string } | null>(null);

  // Sync to URL (replace so we don't pollute history)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "all") params.set("type", type);
    if (status !== "active") params.set("status", status);
    if (favoritesOnly) params.set("favorite", "true");
    if (folderFilter !== "all") params.set("folderId", folderFilter);
    const qs = params.toString();
    router.replace(qs ? `/dashboard/projects?${qs}` : "/dashboard/projects");
  }, [search, type, status, favoritesOnly, folderFilter, router]);

  const projectsQuery = useQuery({
    queryKey: ["projects", { search, type, status, favoritesOnly, folderFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type !== "all") params.set("type", type);
      if (status !== "all") params.set("status", status);
      if (favoritesOnly) params.set("favorite", "true");
      if (folderFilter !== "all") params.set("folderId", folderFilter);
      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const folders: { id: string; name: string; projectCount: number }[] = foldersQuery.data?.folders ?? [];
  const projects: any[] = projectsQuery.data?.projects ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your designs, illustrations, photos, videos, and animations.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-gradient-brand text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Folders sidebar */}
        <aside className="space-y-3">
          <Card className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Folders</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFolderCreateOpen(true)}
                aria-label="New folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => setFolderFilter("all")}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    folderFilter === "all" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                >
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-left">All Projects</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFolderFilter("none")}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    folderFilter === "none" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                >
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">Unfiled</span>
                </button>
              </li>
              {folders.map((f) => (
                <li key={f.id} className="group relative">
                  <button
                    onClick={() => setFolderFilter(f.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                      folderFilter === f.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    }`}
                  >
                    <Folder className="h-4 w-4 text-amber-400" />
                    <span className="flex-1 truncate text-left">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.projectCount}</span>
                  </button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderRename({ id: f.id, name: f.name });
                      }}
                      aria-label="Rename folder"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-danger hover:text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderDelete({ id: f.id, name: f.name });
                      }}
                      aria-label="Delete folder"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
              {folders.length === 0 && (
                <li className="px-2 py-2 text-xs text-muted-foreground">
                  No folders yet. Click + to create one.
                </li>
              )}
            </ul>
          </Card>
        </aside>

        {/* Main: filter bar + grid */}
        <div className="space-y-4 min-w-0">
          {/* Filter bar */}
          <Card className="p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="pl-9"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={favoritesOnly ? "default" : "outline"}
                size="icon"
                onClick={() => setFavoritesOnly((v) => !v)}
                aria-label="Toggle favorites"
                title="Favorites only"
              >
                <Star className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
              </Button>
              <div className="flex rounded-md border border-border overflow-hidden">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Projects grid */}
          {projectsQuery.isLoading ? (
            <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={view === "grid" ? "h-44 w-full" : "h-20 w-full"} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects found"
              description="Try adjusting your filters, or create a new project to get started."
              action={
                <Button onClick={() => setCreateOpen(true)} className="bg-gradient-brand">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              }
            />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {projects.length} project{projects.length !== 1 && "s"}
              </p>
              <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    folders={folders.map((f) => ({ id: f.id, name: f.name }))}
                    view={view}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        folders={folders.map((f) => ({ id: f.id, name: f.name }))}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["projects"] });
          qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }}
      />

      <CreateFolderDialog
        open={folderCreateOpen}
        onOpenChange={setFolderCreateOpen}
        onCreated={() => qc.invalidateQueries({ queryKey: ["folders"] })}
      />

      {folderRename && (
        <RenameFolderDialog
          open={!!folderRename}
          onOpenChange={(v) => !v && setFolderRename(null)}
          folder={folderRename}
          onRenamed={() => {
            qc.invalidateQueries({ queryKey: ["folders"] });
            setFolderRename(null);
          }}
        />
      )}

      {folderDelete && (
        <DeleteFolderDialog
          open={!!folderDelete}
          onOpenChange={(v) => !v && setFolderDelete(null)}
          folder={folderDelete}
          onDeleted={() => {
            qc.invalidateQueries({ queryKey: ["folders"] });
            qc.invalidateQueries({ queryKey: ["projects"] });
            if (folderFilter === folderDelete.id) setFolderFilter("all");
            setFolderDelete(null);
          }}
        />
      )}
    </div>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  folders,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folders: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("design");
  const [folderId, setFolderId] = useState("none");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName("");
      setType("design");
      setFolderId("none");
    }
  }, [open]);

  const onCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          folderId: folderId === "none" ? null : folderId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Project created", {
        description: "Editor coming soon — project saved to your workspace.",
      });
      onCreated();
      onOpenChange(false);
      router.push("/dashboard/projects");
    } catch (e: any) {
      toast.error(e.message ?? "Could not create project");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Choose a type and name. The editor will be available soon.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proj-name">Project name</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Brand Identity — Aurora"
              onKeyDown={(e) => e.key === "Enter" && onCreate()}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Folder (optional)</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={busy || !name.trim()} className="bg-gradient-brand">
            {busy ? "Creating…" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateFolderDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const onCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Folder created");
      onCreated();
      onOpenChange(false);
    } catch {
      toast.error("Could not create folder");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>Organize your projects into folders.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="folder-name">Folder name</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Brand Work"
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={busy || !name.trim()} className="bg-gradient-brand">
            {busy ? "Creating…" : "Create folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameFolderDialog({
  open,
  onOpenChange,
  folder,
  onRenamed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folder: { id: string; name: string };
  onRenamed: () => void;
}) {
  const [name, setName] = useState(folder.name);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(folder.name);
  }, [folder]);

  const onRename = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Folder renamed");
      onRenamed();
    } catch {
      toast.error("Could not rename folder");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-folder">Folder name</Label>
          <Input
            id="rename-folder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && onRename()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onRename} disabled={busy || !name.trim()}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteFolderDialog({
  open,
  onOpenChange,
  folder,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folder: { id: string; name: string };
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const onDelete = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Folder deleted");
      onDeleted();
    } catch {
      toast.error("Could not delete folder");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete folder?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{folder.name}</span> will be removed.
            Projects inside will be moved to Unfiled.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={busy}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
