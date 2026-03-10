import { cn } from "@/shared/lib/utils";
import { Zap } from "lucide-react";
import type { ForgeLimits } from "../hooks/use-forge-limits";

interface ForgeHeroCardProps {
  limits: ForgeLimits;
  isExhausted: boolean;
  remaining: number;
  onForgeClick: () => void;
  isLoading?: boolean;
}

export function ForgeHeroCard({
  limits,
  isExhausted,
  remaining,
  onForgeClick,
  isLoading = false,
}: ForgeHeroCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 sm:p-8",
        "bg-gradient-to-br from-accent to-amber-600 shadow-lg",
        "border border-accent/50",
      )}
    >
      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 space-y-4">
        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-bold text-accent-foreground text-balance">
          Ready to forge your next group?
        </h2>

        {/* CTA Button */}
        <button
          onClick={onForgeClick}
          disabled={isExhausted || isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg",
            "transition-all duration-200",
            isExhausted
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-accent-foreground text-accent hover:scale-105 active:scale-100 hover:shadow-lg hover:shadow-accent/30",
            isLoading && "opacity-75",
          )}
          aria-label="Forge my group button"
        >
          {isExhausted ? (
            <>
              <span>Limit reached</span>
            </>
          ) : (
            <>
              <Zap size={18} className="shrink-0" />
              <span>Forge My Group</span>
            </>
          )}
        </button>

        {/* Usage indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-accent-foreground/80">
            <span>Daily forges:</span>
            <span>
              {limits.used} of {limits.limit}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: limits.limit }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full transition-colors duration-200",
                  i < limits.used
                    ? "bg-accent-foreground/60"
                    : "bg-accent-foreground/20",
                )}
              />
            ))}
          </div>
        </div>

        {/* Info text */}
        {isExhausted && (
          <p className="text-sm text-accent-foreground/80">
            Resets at midnight. Come back tomorrow to forge again.
          </p>
        )}

        {remaining > 0 && remaining <= 1 && (
          <p className="text-sm text-accent-foreground/80">
            {remaining === 1
              ? "You have 1 forge remaining today"
              : "Last forge available today"}
          </p>
        )}
      </div>
    </div>
  );
}
