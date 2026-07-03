import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MessageSelectionToggleProps } from "./types";

export function MessageSelectionToggle({
  isSelected,
  onToggle,
}: MessageSelectionToggleProps) {
  return (
    <button
      type="button"
      aria-label={isSelected ? "Unselect message" : "Select message"}
      aria-pressed={isSelected}
      className={cn(
        "absolute top-1/2 left-0 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/70 bg-canvas/90 text-slate-muted backdrop-blur-md hover:border-primary/45 hover:text-primary",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {isSelected ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </button>
  );
}
