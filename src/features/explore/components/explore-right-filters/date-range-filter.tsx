import { X } from "lucide-react";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/date-input";

interface DateRangeFilterState {
  hasDateRange: boolean;
  startsAfterMax: string | undefined;
  startsAfterValue: string;
  startsBeforeMin: string;
  startsBeforeValue: string;
  todayValue: string;
}

function getTodayDateValue() {
  return toDateInputValue(new Date());
}

function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    toDateInputPart(date.getMonth() + 1),
    toDateInputPart(date.getDate()),
  ].join("-");
}

function toDateInputPart(value: number) {
  return String(value).padStart(2, "0");
}

function getDateRangeFilterState(input: {
  startsAfter: string | null;
  startsBefore: string | null;
}): DateRangeFilterState {
  const todayValue = getTodayDateValue();

  return {
    hasDateRange: hasDateRangeValue(input),
    startsAfterMax: getStartsAfterMax(input.startsBefore, todayValue),
    startsAfterValue: input.startsAfter ?? "",
    startsBeforeMin: getStartsBeforeMin(input.startsAfter, todayValue),
    startsBeforeValue: input.startsBefore ?? "",
    todayValue,
  };
}

function hasDateRangeValue(input: {
  startsAfter: string | null;
  startsBefore: string | null;
}) {
  return Boolean(input.startsAfter || input.startsBefore);
}

function getStartsAfterMax(startsBefore: string | null, todayValue: string) {
  return startsBefore && startsBefore >= todayValue ? startsBefore : undefined;
}

function getStartsBeforeMin(startsAfter: string | null, todayValue: string) {
  return startsAfter && startsAfter > todayValue ? startsAfter : todayValue;
}

export function DateRangeFilter() {
  const {
    setStartsAfter,
    setStartsBefore,
    setTimeWindow,
    startsAfter,
    startsBefore,
  } = useExploreRouteState();
  const rangeState = getDateRangeFilterState({ startsAfter, startsBefore });

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
        {rangeState.hasDateRange ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearDateRange}
            className="h-11 lg:h-9"
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
            value={rangeState.startsAfterValue}
            min={rangeState.todayValue}
            max={rangeState.startsAfterMax}
            placeholder="From"
            onValueChange={updateStartsAfter}
            className="h-11 pr-2 pl-8 text-xs lg:h-9"
            aria-label="Start date from"
          />
        </label>
        <label className="min-w-0" htmlFor="explore-starts-before">
          <span className="sr-only">To</span>
          <DateInput
            id="explore-starts-before"
            value={rangeState.startsBeforeValue}
            min={rangeState.startsBeforeMin}
            placeholder="To"
            onValueChange={updateStartsBefore}
            className="h-11 pr-2 pl-8 text-xs lg:h-9"
            aria-label="Start date to"
          />
        </label>
      </div>
    </section>
  );
}
