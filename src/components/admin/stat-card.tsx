import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: number; positive?: boolean };
  accent?: "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

const ACCENTS: Record<string, string> = {
  primary: "bg-violet-500/15 text-violet-300",
  secondary: "bg-sky-500/15 text-sky-300",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  danger: "bg-rose-500/15 text-rose-300",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "primary",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          {trend && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                trend.positive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}% vs last week
            </p>
          )}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", ACCENTS[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
