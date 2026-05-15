import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { DateInput } from "@/shared/components/ui/date-input";

export function DateRangeFilter() {
  const {
    setStartsAfter,
    setStartsBefore,
    setTimeWindow,
    startsAfter,
    startsBefore,
  } = useExploreRouteState();
  const hasDateRange = Boolean(startsAfter || startsBefore);

  function updateStartsAfter(nextStartsAfter: string) {
    setTimeWindow("ALL");
    setStartsAfter(nextStartsAfter || null);
  }

  function updateStartsBefore(nextStartsBefore: string) {
    setTimeWindow("ALL");
    setStartsBefore(nextStartsBefore || null);
  }

  function clearDateRange() {
    setStartsAfter(null);
    setStartsBefore(null);
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-foreground text-sm">Date range</h4>
        {hasDateRange ? (
          <button
            type="button"
            onClick={clearDateRange}
            className="font-bold text-muted-foreground text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0" htmlFor="explore-starts-after">
          <span className="sr-only">From</span>
          <DateInput
            id="explore-starts-after"
            value={startsAfter ?? ""}
            max={startsBefore ?? undefined}
            placeholder="From"
            onValueChange={updateStartsAfter}
            className="h-9 pr-2 pl-8 text-xs"
            aria-label="Start date from"
          />
        </label>
        <label className="min-w-0" htmlFor="explore-starts-before">
          <span className="sr-only">To</span>
          <DateInput
            id="explore-starts-before"
            value={startsBefore ?? ""}
            min={startsAfter ?? undefined}
            placeholder="To"
            onValueChange={updateStartsBefore}
            className="h-9 pr-2 pl-8 text-xs"
            aria-label="Start date to"
          />
        </label>
      </div>
    </section>
  );
}
