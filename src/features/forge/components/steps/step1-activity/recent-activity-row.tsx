import { History } from "lucide-react";

import { RECENT } from "@/features/forge/constants/forge.constants";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "./activity-icon-map";

interface RecentActivityRowProps {
  selectedActivity: string | null;
  onSelect: (activity: string) => void;
}

export function RecentActivityRow({
  selectedActivity,
  onSelect,
}: RecentActivityRowProps) {
  if (RECENT.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          Recent activity
        </p>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <History size={11} />
          <span>View all</span>
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory touch-pan-x">
          {RECENT.map(({ id, label, count }) => {
            const Icon = ICON_MAP[id] || History;
            const active = selectedActivity === label;

            return (
              <button
                key={label}
                type="button"
                onClick={() => onSelect(label)}
                aria-pressed={active}
                className={cn(
                  "group relative flex items-center gap-3 min-w-40 shrink-0 px-3.5 py-3 rounded-2xl border snap-start transition-colors duration-200",
                  active
                    ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                    : "border-border/40 bg-card hover:border-accent/30 hover:bg-accent/5",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent",
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="text-left min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate leading-tight",
                      active ? "text-accent" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {count}x before
                  </p>
                </div>
                {active && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
        <div className="absolute top-0 right-0 bottom-1 w-8 bg-linear-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
