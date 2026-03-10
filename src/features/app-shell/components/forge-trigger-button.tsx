import { cn } from "@/shared/lib/utils";
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
      <button
        type="button"
        onClick={onClick}
        aria-label="Forge my group"
        className={cn(
          // Raised amber circle sitting above bottom nav
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-accent text-accent-foreground",
          "shadow-[0_4px_24px_rgba(245,158,11,0.55)]",
          "transition-transform duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          // Respect reduced motion — single pulse on mount
          "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
          "motion-safe:hover:scale-105",
          className,
        )}
      >
        <Zap size={22} aria-hidden="true" />
      </button>
    );
  }

  // Sidebar variant — full width pill
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Forge my group"
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
        "bg-accent text-accent-foreground font-semibold text-sm",
        "shadow-[0_4px_20px_rgba(245,158,11,0.35)]",
        "transition-all duration-150",
        "hover:shadow-[0_6px_28px_rgba(245,158,11,0.5)] hover:brightness-105",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        // Single pulse animation on mount
        "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
        className,
      )}
    >
      <Zap size={16} aria-hidden="true" />
      Forge My Group
    </button>
  );
}
