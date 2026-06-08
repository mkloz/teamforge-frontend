import { Check, ListFilter, X } from "lucide-react";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface MobileFiltersPanelProps {
  filtered: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  resetFilters: () => void;
}

export function MobileFiltersPanel({
  filtered,
  onOpenChange,
  open,
  resetFilters,
}: MobileFiltersPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border/40 border-l p-0 sm:max-w-md"
      >
        <div className="px-4 py-5 sm:p-6">
          <SheetHeader className="mb-6 sm:mb-8">
            <SheetTitle className="flex items-center gap-2 text-left font-black text-xl tracking-tight">
              <ListFilter className="size-5 text-primary" />
              Refine results
            </SheetTitle>
            <SheetDescription className="text-left font-medium text-muted-foreground text-sm leading-6">
              Changes update the feed immediately. Close this panel when the
              list looks right.
            </SheetDescription>
          </SheetHeader>

          <ExploreRightFilters hideHeader />

          <div className="mt-8 flex flex-col gap-3 border-border/10 border-t pt-6">
            <SheetClose asChild>
              <Button className="w-full">
                <Check className="size-4" aria-hidden="true" />
                Show results
              </Button>
            </SheetClose>
            <Button
              type="button"
              variant="ghost"
              disabled={!filtered}
              onClick={resetFilters}
              className="w-full text-xs disabled:opacity-40"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
