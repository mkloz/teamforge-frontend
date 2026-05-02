import { Filter } from "lucide-react";
import { CategoryFilter } from "./category-filter";
import { LocationFilter } from "./location-filter";
import { SizeFilter } from "./size-filter";
import { AccessFilter } from "./access-filter";

interface ExploreRightFiltersProps {
  hideHeader?: boolean;
}

export function ExploreRightFilters({ hideHeader }: ExploreRightFiltersProps) {
  return (
    <aside className="flex flex-col gap-4">
      {!hideHeader && (
        <div>
          <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-1">
            <Filter className="size-4" />
            Refine Search
          </h3>
          <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium pr-4">
            Dial in exactly what you're looking for. The algorithm will adapt
            instantly.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {/* Categories */}
        <section className="space-y-2">
          <h4 className="text-sm font-bold text-foreground tracking-tight pl-1">
            Categories
          </h4>
          <CategoryFilter />
        </section>

        <div className="h-px w-full bg-border/20" />

        <LocationFilter />

        <div className="h-px w-full bg-border/20" />

        <SizeFilter />

        <div className="h-px w-full bg-border/20" />

        <AccessFilter />
      </div>
    </aside>
  );
}
