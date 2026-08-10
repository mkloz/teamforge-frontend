import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";

interface TopProgressBarProps {
  progress: number; // 0 to 1
  className?: string;
  isGradient?: boolean;
}

/**
 * Shared top progress bar for onboarding and authentication layouts.
 */
export function TopProgressBar({
  progress,
  className,
  isGradient = false, // Default to false now
}: TopProgressBarProps) {
  const progressStyle = {
    "--top-progress-width": `${Math.min(Math.max(progress, 0), 1) * 100}%`,
  } satisfies CSSProperties & Record<`--${string}`, string>;

  return (
    <div
      className={cn(
        "pointer-events-none sticky top-0 right-0 left-0 z-100 h-1.5 overflow-hidden bg-black/5 dark:bg-white/5",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "h-full w-(--top-progress-width) transition-[width] duration-300 ease-out",
          isGradient
            ? "bg-linear-to-r from-brand-teal via-brand-teal to-brand-amber"
            : "bg-brand-teal",
        )}
        style={progressStyle}
      />
    </div>
  );
}
