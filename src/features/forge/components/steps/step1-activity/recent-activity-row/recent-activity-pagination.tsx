import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface RecentActivityPaginationProps {
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function RecentActivityPagination({
  page,
  pageCount,
  onPrevious,
  onNext,
}: RecentActivityPaginationProps) {
  return (
    <nav
      aria-label="Recently used activity pages"
      className="flex shrink-0 items-center overflow-hidden rounded-full border border-border/40 bg-card/80"
    >
      <span
        aria-hidden="true"
        className="border-border/40 border-r px-2 font-semibold text-[11px] text-muted-foreground/55"
      >
        {page + 1}/{pageCount}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Recently used activity page {page + 1} of {pageCount}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onPrevious}
            aria-label="Previous recently used activities"
            className="size-10 rounded-none border-0 border-border/40 border-r bg-transparent text-muted-foreground hover:bg-forge-teal/8 hover:text-forge-teal md:size-7"
          >
            <ChevronLeft size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous activities</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onNext}
            aria-label="Next recently used activities"
            className="size-10 rounded-none border-0 bg-transparent text-muted-foreground hover:bg-forge-teal/8 hover:text-forge-teal md:size-7"
          >
            <ChevronRight size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next activities</TooltipContent>
      </Tooltip>
    </nav>
  );
}
