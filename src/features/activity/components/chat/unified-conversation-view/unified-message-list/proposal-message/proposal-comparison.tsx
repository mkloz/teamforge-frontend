import { ArrowRight } from "lucide-react";
import { memo } from "react";

interface ProposalComparisonProps {
  current: string;
  proposed: string;
}

export const ProposalComparison = memo(function ProposalComparison({
  current,
  proposed,
}: ProposalComparisonProps) {
  return (
    <div className="border-border/30 border-t px-1.5 pt-2">
      <span className="sr-only">
        Current value {current}. Proposed value {proposed}.
      </span>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] items-center gap-2">
        <span className="wrap-break-word block min-w-0 font-semibold text-micro text-muted-foreground/75 leading-snug line-through decoration-muted-foreground/50">
          {current}
        </span>
        <span className="flex size-5 shrink-0 items-center justify-center text-accent">
          <ArrowRight
            className="size-3.5"
            aria-hidden="true"
            strokeWidth={2.25}
          />
        </span>
        <span className="wrap-break-word block min-w-0 font-bold text-foreground text-micro leading-snug">
          {proposed}
        </span>
      </div>
    </div>
  );
});
