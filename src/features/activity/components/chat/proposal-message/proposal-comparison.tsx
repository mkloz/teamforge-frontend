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
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/20 p-2">
        <span className="text-micro font-bold text-muted-foreground">
          Current
        </span>
        <span className="text-micro font-semibold text-muted-foreground line-through">
          {current}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-spark-amber/20 bg-spark-amber/10 p-2">
        <span className="text-micro font-black uppercase text-spark-amber">
          New
        </span>
        <span className="text-micro font-bold text-foreground">{proposed}</span>
      </div>
    </div>
  );
});
