import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

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
    <div className="flex shrink-0 items-center gap-1">
      <span className="mr-1 font-semibold text-micro text-muted-foreground/45">
        {page + 1}/{pageCount}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onPrevious}
        aria-label="Previous recent activities"
        className="size-7 rounded-full border border-border/40 bg-card text-muted-foreground hover:border-accent/35 hover:text-accent"
      >
        <ChevronLeft size={13} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onNext}
        aria-label="Next recent activities"
        className="size-7 rounded-full border border-border/40 bg-card text-muted-foreground hover:border-accent/35 hover:text-accent"
      >
        <ChevronRight size={13} />
      </Button>
    </div>
  );
}
