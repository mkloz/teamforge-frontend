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
    <div className="relative mt-1 flex flex-col gap-2">
      <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-2 rounded-lg border border-border border-dashed bg-muted/20 p-2">
        <span className="font-bold text-micro text-muted-foreground leading-snug">
          Current
        </span>
        <span className="wrap-break-word min-w-0 text-right font-semibold text-micro text-muted-foreground leading-snug line-through">
          {current}
        </span>
      </div>
      <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-2 rounded-lg border border-spark-amber/20 bg-spark-amber/10 p-2">
        <span className="font-bold text-micro text-spark-amber leading-snug">
          New
        </span>
        <span className="wrap-break-word min-w-0 text-right font-bold text-foreground text-micro leading-snug">
          {proposed}
        </span>
      </div>
    </div>
  );
});
