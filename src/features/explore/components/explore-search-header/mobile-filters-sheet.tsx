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
import { cn } from "@/shared/lib/utils";
import { ListFilter, SlidersHorizontal } from "lucide-react";
import { useExploreRouteState } from "../../hooks/use-explore-route-state";
import { ExploreRightFilters } from "../explore-right-filters";

export function MobileFiltersSheet() {
  const { isAnythingFiltered, resetFilters } = useExploreRouteState();
  const filtered = isAnythingFiltered;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "shrink-0 rounded-xl lg:hidden h-10 w-10 border transition-all duration-200",
            filtered
              ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md border-l border-border/40 p-0 overflow-y-auto"
      >
        <div className="p-6">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-left flex items-center gap-2 text-xl font-black tracking-tight">
              <ListFilter className="size-5 text-primary" />
              Filters
            </SheetTitle>
            <SheetDescription className="text-left text-xs font-medium text-muted-foreground">
              Refine your search results to find the perfect group.
            </SheetDescription>
          </SheetHeader>

          <ExploreRightFilters hideHeader />

          <div className="mt-8 pt-6 border-t border-border/10 flex flex-col gap-3">
            <SheetClose asChild>
              <Button className="w-full h-12 rounded-2xl font-bold bg-primary text-primary-foreground shadow-teal-glow hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                Show Results
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <button
                onClick={resetFilters}
                className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset all filters
              </button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
