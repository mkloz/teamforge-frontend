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
        variant="outline"
        size="sm"
        aria-label={filtered ? "Open filters, filters active" : "Open filters"}
        title={filtered ? "Filters active" : "Open filters"}
        onClick={() => setOpen(true)}
        className="group/filter h-9 shrink-0 rounded-full px-2 sm:px-3"
      >
        <SlidersHorizontal
          className={
            filtered
              ? "size-4 shrink-0 text-forge-teal"
              : "size-4 shrink-0 text-primary"
          }
          aria-hidden="true"
        />
        <span className="hidden font-bold text-xs sm:inline">Filters</span>
      </Button>

      {open && (
        <Suspense
          fallback={
            <MobileFiltersLoadingPanel open={open} onOpenChange={setOpen} />
          }
        >
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

function MobileFiltersLoadingPanel({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-border/40 border-l p-0 sm:max-w-md"
      >
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
      </SheetContent>
    </Sheet>
  );
}
