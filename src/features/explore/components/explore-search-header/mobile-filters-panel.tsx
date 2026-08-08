import { Check, ListFilter, X } from "lucide-react";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { Button } from "@/shared/components/ui/button";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface MobileFiltersPanelProps {
  filtered: boolean;
  resetFilters: () => void;
}

export function MobileFiltersPanelContent({
  filtered,
  resetFilters,
}: MobileFiltersPanelProps) {
  return (
    <div className="px-4 py-5 sm:p-6">
      <SheetHeader className="mb-6 sm:mb-8">
        <SheetTitle className="flex items-center gap-2 text-left font-black text-xl tracking-tight">
          <ListFilter className="size-5 text-foreground" />
          Refine results
        </SheetTitle>
        <SheetDescription className="text-left font-medium text-muted-foreground text-sm leading-6">
          Changes update the group list as you make them. Close this panel when
          you are done.
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
  );
}
