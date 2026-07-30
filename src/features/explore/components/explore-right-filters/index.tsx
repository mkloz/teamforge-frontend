import { Filter } from "lucide-react";
import { CategoryFilter } from "./category-filter";
import { DateRangeFilter } from "./date-range-filter";
import { LocationFilter } from "./location-filter";
import { SizeFilter } from "./size-filter";
import { TimeFilter } from "./time-filter";

interface ExploreRightFiltersProps {
  hideHeader?: boolean;
}

export function ExploreRightFilters({ hideHeader }: ExploreRightFiltersProps) {
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
        <DateRangeFilter />
        <SizeFilter />
      </div>
    </aside>
  );
}
