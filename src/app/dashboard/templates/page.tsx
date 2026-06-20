"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search, LayoutTemplate, Sparkles, Crown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/dashboard/empty-state";
import { PROJECT_TYPES, getProjectTypeMeta } from "@/lib/dashboard/constants";

const PALETTE: Record<string, string[]> = {
  design: ["#7C3AED", "#3B82F6"],
  illustration: ["#3B82F6", "#22C55E"],
  photo: ["#22C55E", "#F59E0B"],
  video: ["#F59E0B", "#EF4444"],
  animation: ["#EC4899", "#7C3AED"],
};

interface Template {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  thumbnailUrl?: string | null;
  isPremium: boolean;
  usageCount: number;
  tags?: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["templates", category, premiumOnly, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const templates: Template[] = useMemo(() => {
    let list = data?.templates ?? [];
    if (premiumOnly) list = list.filter((t) => t.isPremium);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, premiumOnly, search]);

  const onUseTemplate = async (t: Template) => {
    setCreating(t.id);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: t.name, type: t.category }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project created from template", {
        description: "Editor coming soon — project saved to your workspace.",
      });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/dashboard/projects");
    } catch {
      toast.error("Could not create project from template");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse pre-made templates to kickstart your next creative project.
        </p>
      </div>

      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PROJECT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={premiumOnly ? "default" : "outline"}
            onClick={() => setPremiumOnly((v) => !v)}
          >
            <Crown className={`mr-2 h-4 w-4 ${premiumOnly ? "fill-current" : ""}`} />
            Premium only
          </Button>
        </div>
      </Card>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates found"
          description="Try a different category or search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t) => {
            const meta = getProjectTypeMeta(t.category);
            const colors = PALETTE[t.category] ?? ["#7C3AED", "#3B82F6"];
            return (
              <Card key={t.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                {/* Thumbnail */}
                <div
                  className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${colors[0]}25 0%, ${colors[1]}25 100%)`,
                  }}
                >
                  {t.thumbnailUrl ? (
                    <img src={t.thumbnailUrl} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <LayoutTemplate
                      className="h-12 w-12 opacity-40"
                      style={{ color: colors[0] }}
                    />
                  )}
                  <div className="absolute left-2 top-2 flex gap-1">
                    <Badge
                      variant="secondary"
                      className="bg-background/80 text-[10px] capitalize"
                      style={{ color: colors[0] }}
                    >
                      {meta.label}
                    </Badge>
                    {t.isPremium && (
                      <Badge className="bg-gradient-brand text-[10px]">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 text-[10px] text-muted-foreground">
                    {t.usageCount > 0 && `${t.usageCount} uses`}
                  </div>
                </div>
                {/* Body */}
                <div className="p-3">
                  <h3 className="truncate text-sm font-semibold">{t.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {t.description ?? `Ready-to-use ${meta.label.toLowerCase()} template.`}
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-gradient-brand text-white hover:opacity-90"
                    disabled={creating === t.id}
                    onClick={() => onUseTemplate(t)}
                  >
                    {creating === t.id ? (
                      <>
                        <Sparkles className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Use Template
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
