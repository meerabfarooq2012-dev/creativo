"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Shapes,
  Type as TypeIcon,
  Sticker,
  LayoutTemplate,
  Pencil,
  Trash2,
  Upload,
  Search,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { adminFetch, ApiError, buildQuery } from "@/lib/admin/api-client";
import type { AdminAsset } from "@/lib/admin/types";
import { fmtBytes, fmtDate } from "@/lib/admin/format";

interface AssetsResponse {
  assets: AdminAsset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const TABS = [
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "icon", label: "Icons", icon: Shapes },
  { value: "font", label: "Fonts", icon: TypeIcon },
  { value: "sticker", label: "Stickers", icon: Sticker },
  { value: "shape", label: "Shapes", icon: Shapes },
  { value: "template", label: "Templates", icon: LayoutTemplate },
];

export default function AdminAssetsPage() {
  const [tab, setTab] = useState("image");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Asset Management"
        description="Manage platform assets by type — upload, edit metadata, or remove."
      />
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
        <TabsList className="flex-wrap h-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <AssetsTab type={t.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AssetsTab({ type }: { type: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<AdminAsset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<AdminAsset | null>(null);

  const query = buildQuery({ type, search, page, pageSize: 24 });
  const { data, isLoading } = useQuery<AssetsResponse>({
    queryKey: ["admin", "assets", { type, search, page }],
    queryFn: () => adminFetch<AssetsResponse>(`/api/admin/assets${query}`),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => adminFetch(`/api/admin/assets`, { method: "POST", body: formData }),
    onSuccess: () => {
      toast.success("Asset uploaded");
      setUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) => adminFetch(`/api/admin/assets/${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSuccess: () => {
      toast.success("Asset updated");
      setEditAsset(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/assets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Asset deleted");
      setDeleteAsset(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
    },
    onError: (e: ApiError) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search assets by name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Search assets"
            />
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" /> Upload
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : data && data.assets.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.assets.map((a) => (
              <Card key={a.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  {a.type === "image" && (a.thumbnailUrl || a.url) ? (
                    <img src={a.thumbnailUrl || a.url} alt={a.name} className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="size-8" onClick={() => setEditAsset(a)} aria-label="Edit">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="size-8" onClick={() => setDeleteAsset(a)} aria-label="Delete">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {a.isPublic && <Badge className="absolute top-2 left-2 border-transparent bg-emerald-500/80 text-white">Public</Badge>}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{fmtBytes(a.fileSize)} · {fmtDate(a.createdAt)}</p>
                  {a.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {a.tags.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>)}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {data.page} / {data.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-6">
          <EmptyState
            icon={Inbox}
            title="No assets found"
            description={`Upload your first ${type} asset.`}
            action={<Button onClick={() => setUploadOpen(true)}><Upload className="size-4" /> Upload</Button>}
          />
        </Card>
      )}

      <UploadDialog
        key={`upload-${uploadOpen}`}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        type={type}
        onUpload={(formData) => uploadMutation.mutate(formData)}
        loading={uploadMutation.isPending}
      />

      <EditAssetDialog
        key={`edit-${editAsset?.id ?? 'none'}`}
        open={!!editAsset}
        onOpenChange={(o) => !o && setEditAsset(null)}
        asset={editAsset}
        onSubmit={(body) => editAsset && editMutation.mutate({ id: editAsset.id, body })}
        loading={editMutation.isPending}
      />

      <AlertDialog open={!!deleteAsset} onOpenChange={(o) => !o && setDeleteAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteAsset?.name}</span> will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteAsset && deleteMutation.mutate(deleteAsset.id)}
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

function UploadDialog({
  open,
  onOpenChange,
  type,
  onUpload,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  type: string;
  onUpload: (formData: FormData) => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("type", type);
    fd.set("category", category);
    fd.set("tags", tags);
    fd.set("isPublic", String(isPublic));
    if (file) fd.set("file", file);
    onUpload(fd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
          <DialogDescription>Add a new {type} asset to the platform library.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="up-name">Name</Label>
            <Input id="up-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My asset" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="up-cat">Category (optional)</Label>
            <Input id="up-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. nature" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="up-tags">Tags (comma-separated)</Label>
            <Input id="up-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vibrant, abstract" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="up-file">File</Label>
            <Input id="up-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="up-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="up-public">Public (available to all users)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={loading || !name || !file} onClick={submit}>
            {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : <Upload className="size-4 mr-1" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditAssetDialog({
  open,
  onOpenChange,
  asset,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  asset: AdminAsset | null;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(asset?.name || "");
  const [category, setCategory] = useState(asset?.category || "");
  const [tags, setTags] = useState((asset?.tags || []).join(", "));
  const [isPublic, setIsPublic] = useState(asset?.isPublic ?? false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit asset</DialogTitle>
          <DialogDescription>Update metadata for {asset?.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ed-name">Name</Label>
            <Input id="ed-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ed-cat">Category</Label>
            <Input id="ed-cat" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ed-tags">Tags (comma-separated)</Label>
            <Input id="ed-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="ed-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="ed-public">Public</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={loading}
            onClick={() => onSubmit({ name, category, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), isPublic })}
          >
            {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
