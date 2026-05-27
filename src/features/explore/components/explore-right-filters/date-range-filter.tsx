import { X } from "lucide-react";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/date-input";

function getTodayDateValue() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export function DateRangeFilter() {
  const {
    setStartsAfter,
    setStartsBefore,
    setTimeWindow,
    startsAfter,
    startsBefore,
  } = useExploreRouteState();
  const hasDateRange = Boolean(startsAfter || startsBefore);
  const todayValue = getTodayDateValue();
  const startsAfterMax =
    startsBefore && startsBefore >= todayValue ? startsBefore : undefined;
  const startsBeforeMin =
    startsAfter && startsAfter > todayValue ? startsAfter : todayValue;

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
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearDateRange}
          >
            <X className="size-3" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0" htmlFor="explore-starts-after">
          <span className="sr-only">From</span>
          <DateInput
            id="explore-starts-after"
            value={startsAfter ?? ""}
            min={todayValue}
            max={startsAfterMax}
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
            min={startsBeforeMin}
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
