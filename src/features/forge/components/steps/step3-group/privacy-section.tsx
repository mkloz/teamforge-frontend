import type { Visibility } from "@/features/forge/lib/forge-contract";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

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
    <section className="space-y-3 border-border/25 border-t pt-4">
      <div className="px-0.5">
        <p className="font-semibold text-muted-foreground text-xs md:text-sm">
          Who can find this group?
        </p>
        <p className="mt-0.5 text-muted-foreground/60 text-xs">
          Controls who can discover and join.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {VISIBILITY_OPTIONS.map(({ value, label, description, Icon }) => {
          const active = visibility === value;

          return (
            <Button
              key={value}
              type="button"
              variant="ghost"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onVisibilityChange(value)}
              className={cn(
                "group h-auto w-full min-w-0 items-start justify-start whitespace-normal rounded-lg border p-3 text-left transition-colors duration-200",
                active
                  ? "border-forge-teal/55 bg-forge-teal/10 shadow-sm ring-1 ring-forge-teal/20"
                  : "border-border/40 bg-card hover:border-forge-teal/30 hover:bg-forge-teal/5",
              )}
              contentClassName="min-w-0 items-start justify-start gap-3 whitespace-normal sm:grid sm:w-full sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-3 sm:gap-y-0"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:col-start-1 sm:row-start-1",
                  active
                    ? "bg-forge-teal text-white shadow-forge-teal/25 shadow-sm"
                    : "bg-muted text-muted-foreground group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
                )}
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1 space-y-1 sm:contents">
                <p
                  className={cn(
                    "min-w-0 text-pretty font-semibold text-[13px] leading-tight sm:col-start-2 sm:row-start-1 sm:self-center",
                    active ? "text-forge-teal" : "text-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="min-w-0 text-pretty text-[11px] text-muted-foreground leading-snug sm:col-span-3 sm:col-start-1 sm:row-start-2 sm:pt-2">
                  {description}
                </p>
              </div>
              <div
                className={cn(
                  "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 sm:col-start-3 sm:row-start-1",
                  active
                    ? "border-forge-teal bg-forge-teal"
                    : "border-border/50",
                )}
              >
                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
