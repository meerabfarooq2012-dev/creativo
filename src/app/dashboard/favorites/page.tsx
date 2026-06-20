"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function FavoritesPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/projects?favorite=true");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const projects: any[] = data?.projects ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Star className="h-6 w-6 fill-warning text-warning" />
            Favorites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick access to your starred projects.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>
          All Projects
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Star your most-used projects from the project menu to find them here."
          action={
            <Button asChild className="bg-gradient-brand">
              <a href="/dashboard/projects">Browse projects</a>
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {projects.length} favorite project{projects.length !== 1 && "s"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
