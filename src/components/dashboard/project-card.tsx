"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Star,
  FolderInput,
  CheckCircle2,
  Circle,
  PenTool,
  Brush,
  Image as ImageIcon,
  Video,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getProjectTypeMeta, timeAgo } from "@/lib/dashboard/constants";
import { useQueryClient } from "@tanstack/react-query";

const PROJECT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  design: PenTool,
  illustration: Brush,
  photo: ImageIcon,
  video: Video,
  animation: Sparkles,
};

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    type: string;
    thumbnail?: string | null;
    status: string;
    isFavorite: boolean;
    folderId?: string | null;
    lastOpenedAt?: string | null;
    updatedAt?: string | null;
  };
  folders?: { id: string; name: string }[];
  view?: "grid" | "list";
}

export function ProjectCard({ project, folders = [], view = "grid" }: ProjectCardProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const [moveTarget, setMoveTarget] = useState<string>(project.folderId ?? "none");
  const [isBusy, setIsBusy] = useState(false);

  const meta = getProjectTypeMeta(project.type);
  const Icon = PROJECT_TYPE_ICONS[project.type] ?? PenTool;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    qc.invalidateQueries({ queryKey: ["favorites"] });
    router.refresh();
  };

  const onRename = async () => {
    if (!renameValue.trim()) return;
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project renamed");
      setRenameOpen(false);
      invalidate();
    } catch {
      toast.error("Could not rename project");
    } finally {
      setIsBusy(false);
    }
  };

  const onDuplicate = async () => {
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project duplicated");
      invalidate();
    } catch {
      toast.error("Could not duplicate project");
    } finally {
      setIsBusy(false);
    }
  };

  const onDelete = async () => {
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project moved to trash");
      setDeleteOpen(false);
      invalidate();
    } catch {
      toast.error("Could not delete project");
    } finally {
      setIsBusy(false);
    }
  };

  const onToggleFavorite = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !project.isFavorite }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(project.isFavorite ? "Removed from favorites" : "Added to favorites");
      invalidate();
    } catch {
      toast.error("Could not update favorite");
    }
  };

  const onArchiveToggle = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: project.status === "archived" ? "active" : "archived" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(project.status === "archived" ? "Restored from archive" : "Moved to archive");
      invalidate();
    } catch {
      toast.error("Could not update project");
    }
  };

  const onMove = async () => {
    setIsBusy(true);
    try {
      const folderId = moveTarget === "none" ? null : moveTarget;
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project moved");
      setMoveOpen(false);
      invalidate();
    } catch {
      toast.error("Could not move project");
    } finally {
      setIsBusy(false);
    }
  };

  const openProject = async () => {
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastOpened: true }),
      });
    } catch {
      /* ignore */
    }
    toast.info("Editor coming soon — your project is saved.");
  };

  const Thumbnail = (
    <div
      className="relative flex items-center justify-center overflow-hidden bg-gradient-brand-soft"
      style={{ aspectRatio: view === "list" ? "16/10" : "16/9" }}
    >
      {project.thumbnail ? (
        <img src={project.thumbnail} alt={project.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center text-muted-foreground">
          <Icon className="h-8 w-8" style={{ color: meta.color }} />
          <span className="mt-1 text-[10px] uppercase tracking-wide">{meta.label}</span>
        </div>
      )}
      {project.isFavorite && (
        <Star className="absolute right-2 top-2 h-4 w-4 fill-warning text-warning" />
      )}
      {project.status === "archived" && (
        <div className="absolute left-2 top-2 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium">
          Archived
        </div>
      )}
    </div>
  );

  if (view === "list") {
    return (
      <>
        <Card className="flex items-center gap-3 overflow-hidden p-3 transition-shadow hover:shadow-md">
          <button
            onClick={openProject}
            className="h-14 w-24 shrink-0 rounded-md overflow-hidden"
            aria-label={`Open ${project.name}`}
          >
            {Thumbnail}
          </button>
          <button onClick={openProject} className="flex-1 min-w-0 text-left">
            <p className="truncate text-sm font-semibold">{project.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]" style={{ color: meta.color }}>
                {meta.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Last opened {timeAgo(project.lastOpenedAt ?? project.updatedAt)}
              </span>
            </div>
          </button>
          <ProjectMenu
            project={project}
            onRename={() => setRenameOpen(true)}
            onDuplicate={onDuplicate}
            onDelete={() => setDeleteOpen(true)}
            onToggleFavorite={onToggleFavorite}
            onArchiveToggle={onArchiveToggle}
            onMove={() => setMoveOpen(true)}
            isBusy={isBusy}
          />
        </Card>

        <RenameDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          value={renameValue}
          setValue={setRenameValue}
          onConfirm={onRename}
          isBusy={isBusy}
        />
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          name={project.name}
          onConfirm={onDelete}
          isBusy={isBusy}
        />
        <MoveDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          folders={folders}
          value={moveTarget}
          setValue={setMoveTarget}
          onConfirm={onMove}
          isBusy={isBusy}
        />
      </>
    );
  }

  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <button
          onClick={openProject}
          className="block w-full text-left"
          aria-label={`Open ${project.name}`}
        >
          {Thumbnail}
        </button>
        <div className="flex items-center gap-2 p-3">
          <div className="min-w-0 flex-1">
            <button onClick={openProject} className="block w-full text-left">
              <p className="truncate text-sm font-semibold">{project.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]" style={{ color: meta.color }}>
                  {meta.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(project.lastOpenedAt ?? project.updatedAt)}
                </span>
              </div>
            </button>
          </div>
          <ProjectMenu
            project={project}
            onRename={() => setRenameOpen(true)}
            onDuplicate={onDuplicate}
            onDelete={() => setDeleteOpen(true)}
            onToggleFavorite={onToggleFavorite}
            onArchiveToggle={onArchiveToggle}
            onMove={() => setMoveOpen(true)}
            isBusy={isBusy}
          />
        </div>
      </Card>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        value={renameValue}
        setValue={setRenameValue}
        onConfirm={onRename}
        isBusy={isBusy}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        name={project.name}
        onConfirm={onDelete}
        isBusy={isBusy}
      />
      <MoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        folders={folders}
        value={moveTarget}
        setValue={setMoveTarget}
        onConfirm={onMove}
        isBusy={isBusy}
      />
    </>
  );
}

function ProjectMenu({
  project,
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onArchiveToggle,
  onMove,
  isBusy,
}: {
  project: { isFavorite: boolean; status: string };
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onArchiveToggle: () => void;
  onMove: () => void;
  isBusy: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={isBusy}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Project menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRename} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleFavorite} className="cursor-pointer">
          {project.isFavorite ? (
            <>
              <Circle className="mr-2 h-4 w-4" />
              Remove favorite
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Add to favorites
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMove} className="cursor-pointer">
          <FolderInput className="mr-2 h-4 w-4" />
          Move to folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchiveToggle} className="cursor-pointer">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {project.status === "archived" ? "Restore" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-danger focus:text-danger">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RenameDialog({
  open,
  onOpenChange,
  value,
  setValue,
  onConfirm,
  isBusy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;
  setValue: (v: string) => void;
  onConfirm: () => void;
  isBusy: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Enter a new name for your project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-name">Project name</Label>
          <Input
            id="rename-name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isBusy || !value.trim()}>
            {isBusy ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
  isBusy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  onConfirm: () => void;
  isBusy: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{name}</span> will be moved to trash. You can
            recover it later from the trash bin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isBusy}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isBusy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MoveDialog({
  open,
  onOpenChange,
  folders,
  value,
  setValue,
  onConfirm,
  isBusy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folders: { id: string; name: string }[];
  value: string;
  setValue: (v: string) => void;
  onConfirm: () => void;
  isBusy: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>Select a destination folder.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Destination</Label>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No folder (root)</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Moving…" : "Move project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
