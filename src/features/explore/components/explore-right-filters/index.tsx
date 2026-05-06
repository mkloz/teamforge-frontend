import { ChevronDown, Filter } from "lucide-react";
import { CategoryFilter } from "./category-filter";
import { LocationFilter } from "./location-filter";
import { SizeFilter } from "./size-filter";
import { AccessFilter } from "./access-filter";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

interface ExploreRightFiltersProps {
  hideHeader?: boolean;
}

export function ExploreRightFilters({ hideHeader }: ExploreRightFiltersProps) {
  const { access, sizeRange } = useExploreRouteState();
  const hasMoreOptionFilters =
    access !== DEFAULT_FILTERS.access ||
    sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
    sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1];

  return (
    <aside className="flex flex-col gap-6">
      {!hideHeader && (
        <div>
          <h3 className="mb-1.5 flex items-center gap-2 text-base font-bold text-foreground">
            <Filter className="size-4.5" aria-hidden="true" />
            Refine
          </h3>
          <p className="pr-4 text-sm font-medium leading-relaxed text-muted-foreground">
            Narrow the list once you know what kind of opening you want.
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-6">
        <section className="space-y-2">
          <h4 className="pl-1 text-base font-bold tracking-tight text-foreground">
            Activity
          </h4>
          <CategoryFilter />
        </section>

        <LocationFilter />

        <details className="group space-y-4" open={hasMoreOptionFilters}>
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-border/60 bg-card/35 px-3.5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-border hover:bg-muted/25 hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>More options</span>
            <ChevronDown
              className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="space-y-5 pt-1">
            <SizeFilter />
            <AccessFilter />
          </div>
        </details>
      </div>
    </aside>
  );
}
