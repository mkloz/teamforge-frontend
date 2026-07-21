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
      aria-label="Recent activity pages"
      className="flex shrink-0 items-center gap-1"
    >
      <span
        aria-hidden="true"
        className="mr-1 font-semibold text-muted-foreground/45 text-xs"
      >
        {page + 1}/{pageCount}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Recent activity page {page + 1} of {pageCount}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onPrevious}
            aria-label="Previous recent activities"
            className="size-11 rounded-full border border-border/40 bg-card text-muted-foreground hover:border-accent/35 hover:text-accent md:size-7"
          >
            <ChevronLeft size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous recent activities</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onNext}
            aria-label="Next recent activities"
            className="size-11 rounded-full border border-border/40 bg-card text-muted-foreground hover:border-accent/35 hover:text-accent md:size-7"
          >
            <ChevronRight size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next recent activities</TooltipContent>
      </Tooltip>
    </nav>
  );
}
