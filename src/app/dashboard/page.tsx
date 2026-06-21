"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  PenTool,
  Brush,
  Image as ImageIcon,
  Video,
  Sparkles,
  Clapperboard,
  Box,
  ArrowRight,
  Clock,
  Palette,
  LayoutTemplate,
  Rocket,
  Sparkle,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/dashboard/constants";

const CREATE_OPTIONS = [
  { type: "design", label: "Design", icon: PenTool, color: "#7C3AED", desc: "Posters, logos, social media" },
  { type: "illustration", label: "Illustration", icon: Brush, color: "#3B82F6", desc: "Drawings, digital art" },
  { type: "photo", label: "Photo Edit", icon: ImageIcon, color: "#22C55E", desc: "Retouch, filter, enhance" },
  { type: "video", label: "Video Edit", icon: Video, color: "#F59E0B", desc: "Trim, effects, export" },
  { type: "animation", label: "2D Animation", icon: Clapperboard, color: "#EC4899", desc: "Keyframes, motion" },
  { type: "animation", label: "3D Animation", icon: Box, color: "#06B6D4", desc: "3D models, scenes" },
] as const;

const BRAND_COLORS = [
  { name: "Primary", hex: "#7C3AED", color: "bg-[#7C3AED]" },
  { name: "Secondary", hex: "#3B82F6", color: "bg-[#3B82F6]" },
  { name: "Accent 1", hex: "#22D3EE", color: "bg-[#22D3EE]" },
  { name: "Accent 2", hex: "#22C55E", color: "bg-[#22C55E]" },
  { name: "Accent 3", hex: "#F59E0B", color: "bg-[#F59E0B]" },
  { name: "Danger", hex: "#EF4444", color: "bg-[#EF4444]" },
];

const TEMPLATE_CATEGORIES = [
  { name: "Instagram Post", count: 24, color: "#7C3AED" },
  { name: "YouTube Thumbnail", count: 18, color: "#F59E0B" },
  { name: "Logo Design", count: 32, color: "#3B82F6" },
  { name: "Poster", count: 15, color: "#22C55E" },
  { name: "Business Card", count: 12, color: "#EC4899" },
  { name: "Presentation", count: 20, color: "#06B6D4" },
];

export default function DashboardOverviewPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [creating, setCreating] = useState<string | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/projects?status=active");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const recentProjects = (projectsData?.projects ?? []).slice(0, 4);

  const onCreate = async (type: string, label: string) => {
    setCreating(label);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Untitled ${label}`, type }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${label} project created`, {
        description: "Editor coming soon — saved to your workspace.",
      });
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push("/dashboard/projects");
    } catch (e: any) {
      toast.error(e.message ?? "Could not create project");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create Without Limits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up where you left off, or start something new.
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-brand text-white hover:opacity-90"
        >
          <a href="/dashboard/projects">
            View All Projects
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Continue Working — recent projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Continue Working
          </h2>
          <a
            href="/dashboard/projects"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </a>
        </div>
        {projectsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 border-dashed bg-card/50 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-brand-soft">
              <FolderKanban className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No projects yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first design below to get started.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProjects.map((p: any) => (
              <button
                key={p.id}
                onClick={() => router.push("/dashboard/projects")}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-brand-soft">
                  <div className="absolute inset-0 grid-pattern opacity-40" />
                  <div className="absolute left-4 top-4 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                    {p.type}
                  </div>
                  <div className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full bg-gradient-brand text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo(p.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Create New */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Create New
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CREATE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isLoading = creating === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => onCreate(opt.type, opt.label)}
                disabled={isLoading}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50"
              >
                <div
                  className="flex size-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: opt.color, boxShadow: `0 8px 20px -8px ${opt.color}` }}
                >
                  <Icon className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Choose Your Mode */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Rocket className="h-5 w-5 text-primary" />
          Choose Your Mode
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Beginner Mode */}
          <Card className="group relative overflow-hidden border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-lg shadow-primary/30">
                <Sparkle className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Beginner Mode</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag-and-drop templates, basic editing tools. Perfect for getting
                started — no design experience needed.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> Drag-and-drop editor
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> Free templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> Basic editing tools
                </li>
              </ul>
              <Button className="mt-5 w-full bg-gradient-brand text-white hover:opacity-90">
                Choose Beginner
              </Button>
            </div>
          </Card>

          {/* Professional Mode */}
          <Card className="group relative overflow-hidden border-secondary/40 bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/20">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-secondary/10 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary text-white shadow-lg shadow-secondary/30">
                <PenTool className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Professional Mode</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Full layer-based editor, all professional tools. For designers,
                illustrators, and serious creators.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-secondary" /> Layer-based editor
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-secondary" /> All pro tools unlocked
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-secondary" /> Premium templates
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-5 w-full border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary"
              >
                Choose Professional
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Color Palette + Templates (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Palette */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Palette className="h-5 w-5 text-primary" />
            Color Palette
          </h2>
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {BRAND_COLORS.map((c) => (
                <div
                  key={c.hex}
                  className="group cursor-pointer rounded-lg border border-border bg-card/50 p-3 transition-all hover:border-primary/40 hover:bg-card"
                >
                  <div
                    className={`mb-2 h-12 w-full rounded-md ${c.color} shadow-sm transition-transform group-hover:scale-105`}
                  />
                  <p className="text-xs font-semibold text-foreground">{c.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{c.hex}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Templates */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              Templates
            </h2>
            <a
              href="/dashboard/templates"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </a>
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_CATEGORIES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => router.push("/dashboard/templates")}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 text-left transition-all hover:border-primary/40 hover:bg-card"
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    <LayoutTemplate className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.count} templates</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
