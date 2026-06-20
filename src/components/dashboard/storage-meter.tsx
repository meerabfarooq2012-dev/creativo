import { formatMb } from "@/lib/dashboard/constants";
import { Progress } from "@/components/ui/progress";

interface StorageMeterProps {
  usedMb: number;
  limitMb: number;
  compact?: boolean;
}

export function StorageMeter({ usedMb, limitMb, compact = false }: StorageMeterProps) {
  const percent = limitMb > 0 ? Math.min(100, (usedMb / limitMb) * 100) : 0;
  const isWarning = percent >= 80;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {!compact && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Storage</span>
          <span className="text-muted-foreground">
            {formatMb(usedMb)} / {formatMb(limitMb)}
          </span>
        </div>
      )}
      <Progress
        value={percent}
        className={isWarning ? "h-2 bg-muted [&>div]:bg-warning" : "h-2 bg-muted [&>div]:bg-gradient-brand"}
      />
      {compact && (
        <p className="text-[11px] text-muted-foreground">
          {formatMb(usedMb)} of {formatMb(limitMb)} used
        </p>
      )}
      {!compact && (
        <p className="text-[11px] text-muted-foreground">
          {percent.toFixed(1)}% used
          {isWarning && " · Approaching limit"}
        </p>
      )}
    </div>
  );
}
