import { TIME_FILTER_OPTIONS } from "@/features/explore/constants/explore-filter-options";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { cn } from "@/shared/lib/utils";

export function TimeFilter() {
  const { timeWindow, setTimeWindow, startsAfter, startsBefore } =
    useExploreRouteState();
  const hasDateRange = Boolean(startsAfter || startsBefore);

  function selectPreset(nextTimeWindow: typeof timeWindow) {
    setTimeWindow(nextTimeWindow);
  }

  return (
    <section className="flex flex-col gap-2">
      <h4 className="pl-1 font-bold text-foreground text-sm tracking-tight">
        Time
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {TIME_FILTER_OPTIONS.map((option) => {
          const active = !hasDateRange && option.id === timeWindow;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectPreset(option.id)}
              className={cn(
                "inline-flex h-11 min-w-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/35 px-2.5 font-bold text-muted-foreground text-xs transition-colors lg:h-8",
                "hover:border-border hover:bg-muted/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
                active &&
                  "border-forge-teal/40 bg-forge-teal/10 text-forge-teal hover:border-forge-teal/50 hover:bg-forge-teal/12",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
