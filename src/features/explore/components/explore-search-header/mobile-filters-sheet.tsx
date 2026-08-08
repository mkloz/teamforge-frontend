import { SlidersHorizontal } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Spinner } from "@/shared/components/ui/spinner";

const MobileFiltersPanelContent = lazy(() =>
  import("./mobile-filters-panel").then((module) => ({
    default: module.MobileFiltersPanelContent,
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
        variant="outline"
        size="sm"
        aria-label={filtered ? "Open filters, filters active" : "Open filters"}
        title={filtered ? "Filters active" : "Open filters"}
        onClick={() => setOpen(true)}
        className="group/filter h-9 shrink-0 rounded-full px-2 sm:px-3"
      >
        <SlidersHorizontal
          className="size-4 shrink-0 text-current"
          aria-hidden="true"
        />
        <span className="hidden font-bold text-xs sm:inline">Filters</span>
      </Button>

      {open && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-border/40 border-l p-0 sm:max-w-md"
          >
            <Suspense fallback={<MobileFiltersLoadingContent />}>
              <MobileFiltersPanelContent
                filtered={filtered}
                resetFilters={resetFilters}
              />
            </Suspense>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

function MobileFiltersLoadingContent() {
  return (
    <div className="px-4 py-5 sm:p-6">
      <SheetHeader>
        <SheetTitle className="text-left font-black text-xl tracking-tight">
          Refine results
        </SheetTitle>
        <SheetDescription className="text-left">
          Preparing your filters.
        </SheetDescription>
      </SheetHeader>
      <div
        className="mt-8 flex min-h-24 items-center justify-center gap-2 font-semibold text-muted-foreground text-sm"
        role="status"
      >
        <Spinner className="size-4" aria-hidden="true" />
        Loading filters
      </div>
    </div>
  );
}
