import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface TemplatePaginationControlsProps {
  canPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  pageCount: number;
}

export function TemplatePaginationControls({
  canPage,
  onNext,
  onPrevious,
  page,
  pageCount,
}: TemplatePaginationControlsProps) {
  return (
    <nav
      aria-label="Template pages"
      className="flex shrink-0 items-center gap-1"
    >
      <span
        aria-hidden="true"
        className="mr-1 font-semibold text-muted-foreground/45 text-xs"
      >
        {page + 1}/{pageCount}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Template page {page + 1} of {pageCount}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onPrevious}
            disabled={!canPage}
            aria-label="Previous templates"
            className="size-11 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-forge-teal/35 hover:enabled:text-forge-teal disabled:opacity-35 md:size-8"
          >
            <ChevronLeft size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous templates</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onNext}
            disabled={!canPage}
            aria-label="Next templates"
            className="size-11 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-forge-teal/35 hover:enabled:text-forge-teal disabled:opacity-35 md:size-8"
          >
            <ChevronRight size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next templates</TooltipContent>
      </Tooltip>
    </nav>
  );
}
