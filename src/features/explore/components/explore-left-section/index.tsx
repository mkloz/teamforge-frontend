import { ExploreQuickFilters } from "./explore-quick-filters";
import { ForgeCTA } from "./forge-cta";

export function ExploreLeftSection() {
  return (
    <aside className="flex flex-col gap-5">
      <div className="hidden space-y-1.5 px-1 md:block">
        <h1 className="font-black text-2xl text-foreground leading-tight tracking-tight">
          Explore
        </h1>
        <p className="font-medium text-muted-foreground text-sm leading-relaxed">
          Open groups with timing and room to join.
        </p>
      </div>

      <ExploreQuickFilters />

      <div className="px-1 pt-0.5">
        <ForgeCTA />
      </div>
    </aside>
  );
}
