import { memo } from "react";

export const ProposalComparison = memo(
  ({ current, proposed }: { current: string; proposed: string }) => (
    <div className="flex flex-col gap-2 relative mt-1">
      <div className="p-2 rounded-lg bg-muted/20 border border-dashed border-border flex items-center justify-between">
        <span className="text-micro font-bold text-slate-muted">Current</span>
        <span className="text-micro font-semibold text-slate-muted line-through">
          {current}
        </span>
      </div>
      <div className="p-2 rounded-lg bg-spark-amber/10 border border-spark-amber/20 flex items-center justify-between">
        <span className="text-micro font-black text-spark-amber uppercase">
          New
        </span>
        <span className="text-micro font-bold text-ink">{proposed}</span>
      </div>
    </div>
  ),
);
