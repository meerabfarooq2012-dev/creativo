import { cn } from "@/lib/utils";

interface CreativoLogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  /** Render the icon inside a rounded gradient container (app-icon style). */
  boxed?: boolean;
}

/**
 * Creativo brand mark — a stylized "C" with a play-button triangle set into
 * its negative space and pixelated squares breaking off the left edge,
 * carrying a purple → blue → cyan gradient. Designed from the Creativo
 * brand sheet (logo variations / app icon / color palette).
 */
export function CreativoLogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Creativo"
      className={cn(dim, className)}
    >
      <defs>
        <linearGradient
          id="creativo-mark-grad"
          x1="24"
          y1="2"
          x2="24"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* C arc (opens to the right) */}
      <path
        d="M35.2 14.5A14 14 0 1 0 35.2 33.5"
        stroke="url(#creativo-mark-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Play button in negative space */}
      <path d="M21 18.5L29 24L21 29.5Z" fill="url(#creativo-mark-grad)" />
      {/* Pixelated squares breaking off the left edge */}
      <rect x="5.5" y="15" width="4" height="4" rx="1" fill="#8B5CF6" />
      <rect x="3" y="22" width="3" height="3" rx="0.6" fill="#3B82F6" />
      <rect x="5" y="29" width="5" height="5" rx="1.2" fill="#22D3EE" />
      <rect x="10" y="35" width="3" height="3" rx="0.6" fill="#7C3AED" />
    </svg>
  );
}

export function CreativoLogo({
  className,
  showText = true,
  showTagline = false,
  size = "md",
  boxed = false,
}: CreativoLogoProps) {
  const text =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const taglineSize =
    size === "sm" ? "text-[8px]" : size === "lg" ? "text-[11px]" : "text-[10px]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {boxed ? (
        <div className="relative flex items-center justify-center rounded-xl bg-card shadow-lg ring-1 ring-border">
          <CreativoLogoMark size={size} className="!h-[120%] !w-[120%] scale-90" />
        </div>
      ) : (
        <CreativoLogoMark size={size} />
      )}
      {(showText || showTagline) && (
        <div className="flex flex-col leading-none">
          {showText && (
            <span
              className={cn(
                "font-extrabold tracking-tight text-gradient",
                text
              )}
            >
              Creativo
            </span>
          )}
          {showTagline && (
            <span
              className={cn(
                "mt-1 font-semibold uppercase tracking-[0.22em] text-muted-foreground",
                taglineSize
              )}
            >
              <span className="text-[#7C3AED]">Create</span>{" "}
              <span className="text-[#8B5CF6]">Without</span>{" "}
              <span className="text-[#22D3EE]">Limits</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
