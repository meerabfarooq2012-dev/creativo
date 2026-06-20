"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  LayoutTemplate,
  Image as ImageIcon,
  Star,
  Bell,
  LifeBuoy,
  Settings,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { PlanBadge } from "./plan-badge";
import { StorageMeter } from "./storage-meter";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/assets", label: "Assets", icon: ImageIcon },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  plan: string;
  storageUsedMb: number;
  storageLimitMb: number;
  unreadNotifications?: number;
  onNavigate?: () => void;
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export function SidebarContent({
  plan,
  storageUsedMb,
  storageLimitMb,
  unreadNotifications = 0,
  onNavigate,
  user,
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center">
          <CreativoLogo size="sm" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badgeKey === "notifications" && unreadNotifications > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          General
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span className="flex-1">Back to Home</span>
            </Link>
          </li>
        </ul>

        {/* Trial banner */}
        {plan === "FREE" && (
          <div className="mt-6 rounded-lg border border-primary/30 bg-gradient-brand-soft p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Try Pro free
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Unlock 50 GB storage, premium templates & AI Assistant.
            </p>
            <Link
              href="/dashboard/settings"
              onClick={onNavigate}
              className="inline-flex w-full items-center justify-center rounded-md bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start 30-day trial
            </Link>
          </div>
        )}
      </nav>

      {/* Footer: Plan + Storage */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Current Plan</span>
          <PlanBadge plan={plan} />
        </div>
        <StorageMeter usedMb={storageUsedMb} limitMb={storageLimitMb} />
        {user?.email && (
          <p className="mt-3 truncate text-[11px] text-muted-foreground">{user.email}</p>
        )}
      </div>
    </div>
  );
}
