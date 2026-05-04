import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { ModeButtonProps } from "./types";

export function ModeButton({
  active,
  onClick,
  icon,
  title,
  description,
  activeColor,
}: ModeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "group relative h-auto min-w-0 justify-start flex-col items-start gap-2 overflow-hidden whitespace-normal rounded-lg border p-3 text-left transition-colors duration-200",
        active
          ? activeColor === "primary"
            ? "border-forge-teal/55 bg-forge-teal/10 text-forge-teal ring-1 ring-forge-teal/20 shadow-sm"
            : "border-spark-amber/55 bg-spark-amber/10 text-spark-amber ring-1 ring-spark-amber/20 shadow-sm"
          : "border-border/45 bg-card/70 hover:border-forge-teal/25 hover:bg-forge-teal/5 shadow-xs",
      )}
      contentClassName="min-w-0 flex-col items-start justify-start gap-2 whitespace-normal"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            active
              ? activeColor === "primary"
                ? "bg-forge-teal text-white shadow-sm shadow-forge-teal/25"
                : "bg-spark-amber text-ink shadow-sm shadow-spark-amber/25"
              : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "min-w-0 text-wrap text-xs font-black tracking-tight",
            active
              ? activeColor === "primary"
                ? "text-forge-teal"
                : "text-spark-amber"
              : "text-foreground",
          )}
        >
          {title}
        </span>
      </div>
      <p className="min-w-0 text-wrap pr-2 text-micro leading-snug font-semibold text-muted-foreground">
        {description}
      </p>
    </Button>
  );
}
