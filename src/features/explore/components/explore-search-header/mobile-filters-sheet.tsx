import { ListFilter, SlidersHorizontal } from "lucide-react";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

export function MobileFiltersSheet() {
  const { isAnythingFiltered, resetFilters } = useExploreRouteState();
  const filtered = isAnythingFiltered;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={filtered ? "primary" : "outline"}
          size="icon"
          aria-label={
            filtered ? "Open filters, filters active" : "Open filters"
          }
          className="h-11 w-11 shrink-0 lg:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-border/40 p-0 sm:max-w-md"
      >
        <div className="px-4 py-5 sm:p-6">
          <SheetHeader className="mb-6 sm:mb-8">
            <SheetTitle className="flex items-center gap-2 text-left text-xl font-black tracking-tight">
              <ListFilter className="size-5 text-primary" />
              Refine results
            </SheetTitle>
            <SheetDescription className="text-left text-sm leading-6 font-medium text-muted-foreground">
              Changes update the feed immediately. Close this panel when the
              list looks right.
            </SheetDescription>
          </SheetHeader>

          <ExploreRightFilters hideHeader />

          <div className="mt-8 flex flex-col gap-3 border-t border-border/10 pt-6">
            <SheetClose asChild>
              <Button className="h-12 w-full font-bold">Show results</Button>
            </SheetClose>
            <Button
              type="button"
              variant="ghost"
              disabled={!filtered}
              onClick={resetFilters}
              className="h-11 w-full text-xs disabled:opacity-40"
            >
              Clear filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
