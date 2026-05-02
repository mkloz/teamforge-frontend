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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-2.5 p-3.5 rounded-xl border text-left transition-colors duration-300 overflow-hidden",
        active
          ? activeColor === "primary"
            ? "border-primary bg-primary text-primary-foreground shadow-md"
            : "border-accent bg-accent text-accent-foreground shadow-md"
          : "border-border bg-background/50 hover:border-border hover:bg-background shadow-xs",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            active ? "bg-white/20" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-xs font-black tracking-tight",
            active ? "text-inherit" : "text-foreground",
          )}
        >
          {title}
        </span>
      </div>
      <p
        className={cn(
          "text-micro leading-snug font-semibold opacity-90 pr-2",
          active ? "text-inherit/80" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      {active && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -mr-8 -mt-8 rounded-full blur-xl pointer-events-none" />
      )}
    </button>
  );
}
