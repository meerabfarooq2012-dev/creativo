"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ShieldAlert, Info, Megaphone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NOTIFICATION_GROUPS, timeAgo } from "@/lib/dashboard/constants";

const GROUP_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  system: { icon: Info, color: "#3B82F6" },
  subscription: { icon: CreditCard, color: "#7C3AED" },
  security: { icon: ShieldAlert, color: "#EF4444" },
  announcement: { icon: Megaphone, color: "#F59E0B" },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const notifications: any[] = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  // Group by type
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const n of notifications) {
      const arr = map.get(n.type) ?? [];
      arr.push(n);
      map.set(n.type, arr);
    }
    return NOTIFICATION_GROUPS.map((g) => ({ ...g, items: map.get(g.value) ?? [] })).filter(
      (g) => g.items.length > 0
    );
  }, [notifications]);

  const onMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Could not mark as read");
    }
  };

  const onMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Could not mark all as read");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `You have ${unread} unread notification${unread !== 1 ? "s" : ""}.` : "You're all caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={onMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="When something happens, you'll see it here."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => {
            const meta = GROUP_META[group.value] ?? GROUP_META.system;
            const Icon = meta.icon;
            const groupUnread = group.items.filter((n) => !n.isRead).length;
            return (
              <section key={group.value}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  <h2 className="text-sm font-semibold">{group.label}</h2>
                  {groupUnread > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {groupUnread} new
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {group.items.map((n) => (
                    <Card
                      key={n.id}
                      className={`flex items-start gap-3 p-3 transition-colors ${
                        n.isRead ? "bg-card/50" : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: n.isRead ? "transparent" : meta.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.isRead ? "font-medium" : "font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => onMarkRead(n.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
