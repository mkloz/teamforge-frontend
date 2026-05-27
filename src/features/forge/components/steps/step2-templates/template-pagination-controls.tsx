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
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onPrevious}
            disabled={!canPage}
            aria-label="Previous templates"
            className="size-8 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-forge-teal/35 hover:enabled:text-forge-teal disabled:opacity-35"
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
            className="size-8 rounded-full border border-border/45 bg-card text-muted-foreground hover:enabled:border-forge-teal/35 hover:enabled:text-forge-teal disabled:opacity-35"
          >
            <ChevronRight size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next templates</TooltipContent>
      </Tooltip>
    </div>
  );
}
