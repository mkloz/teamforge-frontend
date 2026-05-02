import { Activity } from "lucide-react";

import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "./activity-icon-map";

interface ActivityCategoryGridProps {
  selectedActivity: string | null;
  shaking: boolean;
  onSelect: (activity: string) => void;
}

export function ActivityCategoryGrid({
  selectedActivity,
  shaking,
  onSelect,
}: ActivityCategoryGridProps) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">
          Choose a category
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
          Pick the style that fits your plan and we&apos;ll find the right
          people.
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 transition-transform",
          shaking && "animate-[shake_0.45s_ease-in-out]",
        )}
      >
        {ACTIVITIES.map(({ id, label, description }) => {
          const Icon = ICON_MAP[id] || Activity;
          const selected = selectedActivity === label;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(label)}
              aria-pressed={selected}
              className={cn(
                "group relative flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition duration-200 min-h-25 active:scale-[0.97]",
                selected
                  ? "border-accent bg-accent/8 ring-1 ring-accent/25 shadow-sm"
                  : "border-border/40 bg-card hover:border-accent/30 hover:bg-accent/5",
              )}
            >
              {selected && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                    <path
                      d="M1 3.5L3 5.5L7 1.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200",
                  selected
                    ? "bg-accent text-accent-foreground shadow-sm shadow-accent/25"
                    : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent",
                )}
              >
                <Icon size={17} />
              </div>

              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    selected ? "text-accent" : "text-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
