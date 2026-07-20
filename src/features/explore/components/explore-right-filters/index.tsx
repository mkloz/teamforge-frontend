import { ChevronDown, Filter } from "lucide-react";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { CategoryFilter } from "./category-filter";
import { DateRangeFilter } from "./date-range-filter";
import { LocationFilter } from "./location-filter";
import { SizeFilter } from "./size-filter";
import { TimeFilter } from "./time-filter";

interface ExploreRightFiltersProps {
  hideHeader?: boolean;
}

export function ExploreRightFilters({ hideHeader }: ExploreRightFiltersProps) {
  const { sizeRange, startsAfter, startsBefore } = useExploreRouteState();
  const hasMoreOptionFilters =
    Boolean(startsAfter || startsBefore) ||
    sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
    sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1];

  return (
    <aside className="flex flex-col gap-4">
      {!hideHeader && (
        <div>
          <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground text-sm">
            <Filter className="size-4" aria-hidden="true" />
            Refine
          </h3>
          <p className="pr-4 font-medium text-muted-foreground text-xs leading-relaxed">
            Narrow the list once you know what kind of opening you want.
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-4">
        <section className="flex flex-col gap-1.5">
          <h4 className="pl-1 font-bold text-foreground text-sm tracking-tight">
            Activity
          </h4>
          <CategoryFilter />
        </section>

        <LocationFilter />
        <TimeFilter />

        <details
          className="group flex flex-col gap-3"
          open={hasMoreOptionFilters}
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-border/60 bg-card/35 px-3 py-2 font-bold text-muted-foreground text-xs transition-colors hover:border-border hover:bg-muted/25 hover:text-foreground lg:min-h-0 [&::-webkit-details-marker]:hidden">
            <span>More options</span>
            <ChevronDown
              className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="flex flex-col gap-4 pt-0.5">
            <DateRangeFilter />
            <SizeFilter />
          </div>
        </details>
      </div>
    </aside>
  );
}
