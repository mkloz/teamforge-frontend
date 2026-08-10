import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/shared/components/ui/pagination";
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
  className?: ComponentProps<"nav">["className"];
}

export function TemplatePaginationControls({
  canPage,
  onNext,
  onPrevious,
  page,
  pageCount,
  className,
}: TemplatePaginationControlsProps) {
  return (
    <Pagination
      aria-label="Template pages"
      className={`mx-0 w-auto shrink-0 justify-start ${className ?? ""}`}
    >
      <PaginationContent>
        <PaginationItem>
          <span
            aria-hidden="true"
            className="mr-0.5 block whitespace-nowrap font-semibold text-muted-foreground/55 text-xs tabular-nums"
          >
            {page + 1} / {pageCount}
          </span>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            Template page {page + 1} of {pageCount}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onPrevious}
                disabled={!canPage}
                aria-label="Previous templates"
                className="size-8 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-foreground/40 hover:enabled:text-foreground disabled:opacity-35"
              >
                <ChevronLeft size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous templates</TooltipContent>
          </Tooltip>
        </PaginationItem>
        <PaginationItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onNext}
                disabled={!canPage}
                aria-label="Next templates"
                className="size-8 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-foreground/40 hover:enabled:text-foreground disabled:opacity-35"
              >
                <ChevronRight size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next templates</TooltipContent>
          </Tooltip>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
