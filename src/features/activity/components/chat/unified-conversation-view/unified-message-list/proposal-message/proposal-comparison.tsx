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
      <div className="flex items-center justify-between rounded-lg border border-border border-dashed bg-muted/20 p-2">
        <span className="font-bold text-micro text-muted-foreground">
          Current
        </span>
        <span className="font-semibold text-micro text-muted-foreground line-through">
          {current}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-spark-amber/20 bg-spark-amber/10 p-2">
        <span className="font-black text-micro text-spark-amber uppercase">
          New
        </span>
        <span className="font-bold text-foreground text-micro">{proposed}</span>
      </div>
    </div>
  );
});
