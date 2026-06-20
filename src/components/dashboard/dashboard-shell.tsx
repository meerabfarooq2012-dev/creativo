"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "./top-bar";
import { SidebarContent } from "./sidebar-content";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initialPlan: string;
  initialStorageUsedMb: number;
  initialStorageLimitMb: number;
  initialUnreadNotifications: number;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  initialPlan,
  initialStorageUsedMb,
  initialStorageLimitMb,
  initialUnreadNotifications,
  children,
}: DashboardShellProps) {
  // Live-fetch stats to keep top bar / sidebar fresh across pages
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30_000,
    initialData: {
      plan: initialPlan,
      storage: { usedMb: initialStorageUsedMb, limitMb: initialStorageLimitMb },
      unreadNotifications: initialUnreadNotifications,
    },
  });

  const plan = data?.plan ?? initialPlan;
  const usedMb = data?.storage?.usedMb ?? initialStorageUsedMb;
  const limitMb = data?.storage?.limitMb ?? initialStorageLimitMb;
  const unread = data?.unreadNotifications ?? initialUnreadNotifications;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
          <SidebarContent
            plan={plan}
            storageUsedMb={usedMb}
            storageLimitMb={limitMb}
            unreadNotifications={unread}
            user={user}
          />
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            user={user}
            plan={plan}
            storageUsedMb={usedMb}
            storageLimitMb={limitMb}
            unreadNotifications={unread}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <footer className="mt-auto border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Creativo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/dashboard/support" className="hover:text-foreground">Support</a>
            <a href="/dashboard/settings" className="hover:text-foreground">Settings</a>
            <a href="/" className="hover:text-foreground">Home</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
