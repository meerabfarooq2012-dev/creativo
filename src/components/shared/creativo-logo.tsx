import { cn } from "@/lib/utils";

interface CreativoLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CreativoLogo({
  className,
  showText = true,
  size = "md",
}: CreativoLogoProps) {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const text =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-brand shadow-lg",
          dim
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-1/2 w-1/2 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>
          Creativo
        </span>
      )}
    </div>
  );
}
