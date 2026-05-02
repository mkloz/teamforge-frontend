import { cn } from "@/shared/lib/utils";
import type { Visibility } from "@/features/forge/lib/forge-contract";

import { VISIBILITY_OPTIONS } from "./step3-group.constants";

interface PrivacySectionProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}

export function PrivacySection({
  visibility,
  onVisibilityChange,
}: PrivacySectionProps) {
  return (
    <section className="space-y-3 pt-2 border-t border-muted/20">
      <div className="px-0.5">
        <p className="text-xs md:text-sm font-semibold text-muted-foreground">
          Who can find this group?
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Controls who can discover and join.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {VISIBILITY_OPTIONS.map(({ value, label, description, Icon }) => {
          const active = visibility === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onVisibilityChange(value)}
              className={cn(
                "group w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-colors duration-200",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                  : "border-border/40 bg-card hover:border-primary/30 hover:bg-primary/3",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 mt-0.5",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    active ? "text-primary" : "text-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {description}
                </p>
              </div>
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-1 transition-colors duration-200",
                  active ? "border-primary bg-primary" : "border-border/50",
                )}
              >
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
