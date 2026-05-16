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
    <div className="mt-1 flex min-w-0 items-start gap-2 px-1 py-1">
      <div className="w-fit min-w-0 max-w-28 shrink">
        <span className="mb-1 block font-bold text-micro text-muted-foreground leading-none">
          Current
        </span>
        <span className="wrap-break-word block min-w-0 font-semibold text-micro text-muted-foreground/80 leading-snug line-through">
          {current}
        </span>
      </div>
      <span className="mt-4 flex size-6 shrink-0 rounded-full bg-spark-amber/12 text-spark-amber">
        <ArrowRight className="m-auto size-3.5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="mb-1 block font-bold text-micro text-spark-amber leading-none">
          New
        </span>
        <span className="wrap-break-word block min-w-0 font-bold text-foreground text-micro leading-snug">
          {proposed}
        </span>
      </div>
    </div>
  );
});
