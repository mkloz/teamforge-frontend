import { LoaderCircle, SlidersHorizontal } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";

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
        variant="ghost"
        size="icon"
        aria-label={filtered ? "Open filters, filters active" : "Open filters"}
        title={filtered ? "Filters active" : "Open filters"}
        onClick={() => setOpen(true)}
        className="group/filter size-11 shrink-0 rounded-full p-1 hover:bg-transparent lg:hidden"
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
            filtered
              ? "border-button-primary-border bg-button-primary-border text-primary-foreground"
              : "border-ink bg-transparent text-ink group-hover/filter:bg-ink/5 dark:border-white dark:text-white",
          )}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        </span>
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
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Loading filters
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
