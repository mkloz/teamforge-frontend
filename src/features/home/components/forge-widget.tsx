import { cn } from "@/shared/lib/utils";
import { Sparkles, Zap } from "lucide-react";
import type { ForgeLimits } from "../hooks/use-forge-limits";

interface ForgeWidgetProps {
  limits: ForgeLimits;
  isExhausted: boolean;
  remaining: number;
  onForgeClick: () => void;
  variant?: "inline" | "sidebar";
}

export function ForgeWidget({
  limits,
  isExhausted,
  remaining,
  onForgeClick,
  variant = "sidebar",
}: ForgeWidgetProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        isSidebar
          ? "bg-card border border-border"
          : "bg-gradient-to-br from-accent/90 to-amber-600 border border-accent/30",
      )}
    >
      {/* Header section */}
      <div className={cn("p-4", isSidebar && "border-b border-border")}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isSidebar ? "bg-accent/15" : "bg-white/20",
            )}
          >
            <Sparkles
              className={cn(
                "w-4 h-4",
                isSidebar ? "text-accent" : "text-white",
              )}
            />
          </div>
          <div>
            <h3
              className={cn(
                "text-sm font-semibold",
                isSidebar ? "text-foreground" : "text-white",
              )}
            >
              Forge a Group
            </h3>
            <p
              className={cn(
                "text-xs",
                isSidebar ? "text-muted-foreground" : "text-white/70",
              )}
            >
              Find your perfect match
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onForgeClick}
          disabled={isExhausted}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-4 py-2.5 rounded-xl font-semibold text-sm",
            "transition-all duration-200",
            isExhausted
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isSidebar
                ? "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98]"
                : "bg-white text-accent hover:bg-white/90 active:scale-[0.98]",
          )}
          style={
            !isExhausted && isSidebar
              ? { animation: "pulse-glow-amber 3s ease-in-out infinite" }
              : undefined
          }
        >
          <Zap size={16} className="shrink-0" />
          {isExhausted ? "Limit Reached" : "Forge My Group"}
        </button>
      </div>

      {/* Usage footer */}
      <div
        className={cn(
          "px-4 py-3",
          isSidebar ? "bg-muted/30" : "bg-black/10",
        )}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={cn(
              "text-xs font-medium",
              isSidebar ? "text-muted-foreground" : "text-white/70",
            )}
          >
            Today's forges
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              isSidebar ? "text-foreground" : "text-white",
            )}
          >
            {remaining} left
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: limits.limit }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                i < limits.used
                  ? isSidebar
                    ? "bg-accent/50"
                    : "bg-white/40"
                  : isSidebar
                    ? "bg-accent"
                    : "bg-white",
              )}
            />
          ))}
        </div>

        {isExhausted && (
          <p
            className={cn(
              "text-xs mt-2",
              isSidebar ? "text-muted-foreground" : "text-white/70",
            )}
          >
            Resets at midnight
          </p>
        )}
      </div>
    </div>
  );
}
