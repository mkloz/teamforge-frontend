import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Zap } from "lucide-react";

interface ForgeTriggerButtonProps {
  /** "sidebar" = full-width pill with label; "tab" = circular icon-only raised button */
  variant: "sidebar" | "tab";
  onClick?: () => void;
  className?: string;
}

export function ForgeTriggerButton({
  variant,
  onClick,
  className,
}: ForgeTriggerButtonProps) {
  if (variant === "tab") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onClick}
              aria-label="Forge a new group"
              className={cn(
                // Raised amber circle sitting above bottom nav
                "relative flex h-14 w-14 items-center justify-center rounded-full",
                "bg-accent text-accent-foreground",
                "shadow-[0_4px_24px_rgba(245,158,11,0.55),0_1px_3px_rgba(0,0,0,0.15)]",
                "transition-all duration-150 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
                "motion-safe:hover:scale-105 hover:shadow-[0_6px_32px_rgba(245,158,11,0.7)]",
                className,
              )}
            >
              {/* Inner highlight */}
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <Zap size={22} aria-hidden="true" className="fill-current" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Forge a new group</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Sidebar variant — full width pill with tooltip on tablet (icon-only) mode
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label="Forge a new group"
            className={cn(
              "relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
              "bg-accent text-accent-foreground font-semibold text-sm",
              "shadow-[0_4px_20px_rgba(245,158,11,0.35),0_1px_2px_rgba(0,0,0,0.1)]",
              "transition-all duration-150",
              "hover:shadow-[0_6px_28px_rgba(245,158,11,0.55)] hover:brightness-110",
              "active:scale-[0.97] active:shadow-[0_2px_10px_rgba(245,158,11,0.3)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
              className,
            )}
          >
            {/* Inner highlight */}
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            <Zap
              size={16}
              aria-hidden="true"
              className="fill-current shrink-0"
            />
            <span>Forge My Group</span>
          </button>
        </TooltipTrigger>
        {/* Only show tooltip in collapsed (icon-only) sidebar; visible text makes it redundant on desktop */}
        <TooltipContent side="right" className="lg:hidden">
          Forge a new group
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
