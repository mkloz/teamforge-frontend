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
    <div className="mt-1 overflow-hidden px-1 py-1">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.45fr)] items-start gap-x-2 gap-y-1">
        <span className="min-w-0 truncate font-bold text-micro text-muted-foreground leading-none">
          Current
        </span>
        <span aria-hidden="true" />
        <span className="min-w-0 truncate font-bold text-micro text-spark-amber leading-none">
          New
        </span>

        <span className="wrap-break-word block min-w-0 break-words font-semibold text-micro text-muted-foreground/80 leading-snug line-through">
          {current}
        </span>
        <span className="flex size-6 shrink-0 rounded-full bg-spark-amber/12 text-spark-amber">
          <ArrowRight className="m-auto size-3.5" strokeWidth={2.25} />
        </span>
        <span className="wrap-break-word block min-w-0 break-words font-bold text-foreground text-micro leading-snug">
          {proposed}
        </span>
      </div>
    </div>
  );
});
