"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  value: string;
  className?: string;
}

interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: Rule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function getScore(v: string): number {
  if (!v) return 0;
  return RULES.reduce((acc, r) => acc + (r.test(v) ? 1 : 0), 0);
}

const SCORE_CONFIG = [
  { label: "Too weak", color: "bg-danger", textColor: "text-danger" },
  { label: "Weak", color: "bg-danger", textColor: "text-danger" },
  { label: "Fair", color: "bg-warning", textColor: "text-warning" },
  { label: "Good", color: "bg-secondary", textColor: "text-secondary" },
  { label: "Strong", color: "bg-success", textColor: "text-success" },
];

export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const score = getScore(value);
  const config = SCORE_CONFIG[score];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-10 rounded-full transition-colors",
                i < score ? config.color : "bg-muted"
              )}
            />
          ))}
        </div>
        {value && (
          <span className={cn("text-xs font-medium", config.textColor)}>
            {config.label}
          </span>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <li
              key={rule.label}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              {passed ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground/60" />
              )}
              <span className={passed ? "text-foreground/80" : ""}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
