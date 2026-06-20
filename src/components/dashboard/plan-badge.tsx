import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

const PLAN_STYLES: Record<string, string> = {
  FREE: "bg-slate-700/50 text-slate-300 border-slate-600",
  STUDENT: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  PRO: "bg-primary/15 text-primary border-primary/40",
  TEAM: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const style = PLAN_STYLES[plan] ?? PLAN_STYLES.FREE;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        style,
        className
      )}
    >
      {plan}
    </span>
  );
}
