import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface TemplatePaginationControlsProps {
  canPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function TemplatePaginationControls({
  canPage,
  onNext,
  onPrevious,
}: TemplatePaginationControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canPage}
            aria-label="Previous templates"
            className="flex size-8 items-center justify-center rounded-full border border-border/45 bg-card text-muted-foreground transition-colors duration-200 hover:border-forge-teal/35 hover:text-forge-teal disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={15} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Previous templates</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onNext}
            disabled={!canPage}
            aria-label="Next templates"
            className="flex size-8 items-center justify-center rounded-full border border-border/45 bg-card text-muted-foreground transition-colors duration-200 hover:border-forge-teal/35 hover:text-forge-teal disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={15} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Next templates</TooltipContent>
      </Tooltip>
    </div>
  );
}
