"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FolderKanban,
  ImageIcon,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Settings,
  Menu,
  Search,
  Bell,
  ArrowLeft,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { RoleBadge } from "@/components/admin/badges";
import { useMounted } from "@/hooks/use-mounted";
import { signOut } from "next-auth/react";

interface AdminShellUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/assets", label: "Assets", icon: ImageIcon },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function initials(name: string | null) {
  if (!name) return "AD";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Admin navigation">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-gradient-brand text-white shadow-sm"
                : "text-slate-300 hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <Icon className={cn("size-4 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
      <div className="my-2 h-px bg-sidebar-border" />
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-sidebar-accent hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4 shrink-0 text-slate-400 group-hover:text-white" />
        <span>Back to App</span>
      </Link>
    </nav>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-sidebar-border">
      <CreativoLogo size="sm" />
      <Badge className="bg-rose-500/15 text-rose-300 border-transparent">Admin</Badge>
    </div>
  );
}

function UserMenu({ user }: { user: AdminShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-accent">
          <Avatar className="size-7">
            <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
            <AvatarFallback className="bg-gradient-brand text-white text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium text-foreground">{user.name || user.email}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{user.name || "Admin"}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          <RoleBadge role={user.role} className="mt-1 w-fit" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <UserIcon className="size-4" />
            <span>User Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="size-4" />
            <span>Admin Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-rose-400 focus:text-rose-300"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({ user, children }: { user: AdminShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useMounted();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar (sticky) */}
      <header className="sticky top-0 z-40 border-b border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="md:hidden">
            {mounted ? (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground [&>button]:hidden">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Admin menu</SheetTitle>
                    <SheetDescription>Navigate the admin dashboard</SheetDescription>
                  </SheetHeader>
                  <div className="flex h-full flex-col">
                    <BrandHeader />
                    <div className="flex-1 overflow-y-auto">
                      <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Open menu" disabled>
                <Menu className="size-5" />
              </Button>
            )}
          </div>

          <div className="hidden md:flex">
            <CreativoLogo size="sm" showText={false} />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search users, projects, tickets…"
              className="pl-9 h-9 bg-background/60 border-border"
              aria-label="Admin search"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" />
            </Button>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
          <BrandHeader />
          <div className="flex-1 overflow-y-auto">
            <NavList pathname={pathname} />
          </div>
          <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-muted-foreground">
            <p>Creativo Admin Console</p>
            <p className="mt-0.5">v1.0 · Phase 1 Foundation</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-border bg-sidebar/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Creativo. Admin Console.</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-rose-400" />
            Authorized personnel only — actions are logged.
          </p>
        </div>
      </footer>
    </div>
  );
}
