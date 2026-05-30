import { SlidersHorizontal } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";

const MobileFiltersPanel = lazy(() =>
  import("./mobile-filters-panel").then((module) => ({
    default: module.MobileFiltersPanel,
  })),
);

export function MobileFiltersSheet() {
  const { isAnythingFiltered, resetFilters } = useExploreRouteState();
  const [open, setOpen] = useState(false);
  const filtered = isAnythingFiltered;

  return (
    <>
      <Button
        type="button"
        variant={filtered ? "primary" : "outline"}
        size="icon"
        aria-label={filtered ? "Open filters, filters active" : "Open filters"}
        title={filtered ? "Filters active" : "Open filters"}
        onClick={() => setOpen(true)}
        className="size-9 shrink-0 rounded-full lg:hidden"
      >
        <SlidersHorizontal className="size-3.5" />
      </Button>

      {open && (
        <Suspense fallback={null}>
          <MobileFiltersPanel
            filtered={filtered}
            open={open}
            onOpenChange={setOpen}
            resetFilters={resetFilters}
          />
        </Suspense>
      )}
    </>
  );
}
