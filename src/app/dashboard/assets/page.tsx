"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Search,
  Trash2,
  FileText,
  Image as ImageIcon,
  Type,
  Shapes,
  Sticker,
  Square,
  LayoutTemplate,
  X,
  HardDrive,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StorageMeter } from "@/components/dashboard/storage-meter";
import { ASSET_TYPES, formatBytes, formatMb } from "@/lib/dashboard/constants";

const ASSET_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  icon: Shapes,
  font: Type,
  sticker: Sticker,
  shape: Square,
  template: LayoutTemplate,
};

export default function AssetsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assetsQuery = useQuery({
    queryKey: ["assets", { type, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type !== "all") params.set("type", type);
      if (search) params.set("search", search);
      const res = await fetch(`/api/assets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const assets: any[] = assetsQuery.data?.assets ?? [];

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setUploading(true);
      let okCount = 0;
      for (const file of list) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          // Infer asset type from mime
          let assetType = "image";
          if (file.type.startsWith("image/")) assetType = "image";
          else if (file.type.includes("svg") || file.name.match(/\.(svg)$/i)) assetType = "icon";
          else if (file.name.match(/\.(ttf|otf|woff2?|eot)$/i)) assetType = "font";
          else assetType = "image";
          formData.append("type", assetType);

          const res = await fetch("/api/assets", { method: "POST", body: formData });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? "Upload failed");
          }
          okCount += 1;
        } catch (e: any) {
          toast.error(`${file.name}: ${e.message ?? "Upload failed"}`);
        }
      }
      if (okCount > 0) {
        toast.success(`${okCount} file${okCount !== 1 ? "s" : ""} uploaded`);
      }
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    [qc]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleUpload(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/assets/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Asset deleted");
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Could not delete asset");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage images, icons, fonts, and other assets.
          </p>
        </div>
        <Card className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Storage</span>
          </div>
          <div className="mt-1 min-w-[180px]">
            {statsQuery.data && (
              <StorageMeter
                usedMb={statsQuery.data.storage.usedMb}
                limitMb={statsQuery.data.storage.limitMb}
                compact
              />
            )}
          </div>
        </Card>
      </div>

      {/* Upload zone */}
      <Card
        className={`border-2 border-dashed p-8 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand-soft">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Drag &amp; drop files here</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · images, SVGs, fonts · max size depends on plan
          </p>
          <Button
            className="mt-3 bg-gradient-brand text-white hover:opacity-90"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Browse Files"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileInput}
            accept="image/*,.svg,.ttf,.otf,.woff,.woff2,.eot"
          />
        </div>
      </Card>

      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
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
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Assets grid */}
      {assetsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No assets yet"
          description="Upload images, icons, fonts, or other files to use in your projects."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {assets.map((a) => {
            const Icon = ASSET_TYPE_ICONS[a.type] ?? FileText;
            return (
              <Card key={a.id} className="group overflow-hidden">
                <div className="relative flex aspect-square items-center justify-center bg-muted/30">
                  {a.type === "image" && a.url ? (
                    <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  <Badge
                    variant="secondary"
                    className="absolute left-2 top-2 bg-background/80 text-[10px] uppercase"
                  >
                    {a.type}
                  </Badge>
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80">
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Asset menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={a.url} download className="cursor-pointer">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget({ id: a.id, name: a.name })}
                          className="cursor-pointer text-danger focus:text-danger"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium" title={a.name}>
                    {a.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{formatBytes(a.fileSize)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> will be
              permanently deleted from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
