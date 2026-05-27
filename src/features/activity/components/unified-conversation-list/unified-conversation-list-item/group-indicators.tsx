import { Clock, FileEdit, ListChecks } from "lucide-react";
import { memo, type ReactNode } from "react";

interface GroupIndicatorsProps {
  action?: ReactNode;
  countdown?: string | null;
  isDraft?: boolean;
  pendingProposalCount?: number;
}

export const GroupIndicators = memo(function GroupIndicators({
  action,
  countdown,
  isDraft,
  pendingProposalCount = 0,
}: GroupIndicatorsProps) {
  const hasPendingProposal = pendingProposalCount > 0;
  const hasAnything = !!(countdown || isDraft || hasPendingProposal || action);
  if (!hasAnything) return null;

  return (
    <div className="mt-0.5 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        {countdown && (
          <span className="flex items-center gap-1 font-bold text-forge-teal/80 text-micro">
            <Clock size={11} strokeWidth={2.5} />
            {countdown}
          </span>
        )}
        {isDraft && (
          <span
            className="flex size-4 items-center justify-center rounded-full bg-spark-amber/12 text-spark-amber"
            title="Plan draft pending"
          >
            <FileEdit size={11} aria-hidden="true" strokeWidth={2.5} />
            <span className="sr-only">Plan draft pending</span>
          </span>
        )}
        {hasPendingProposal && (
          <span
            className="flex size-4 items-center justify-center rounded-full bg-spark-amber/12 text-spark-amber"
            title={
              pendingProposalCount === 1
                ? "Plan proposal waiting"
                : `${pendingProposalCount} plan proposals waiting`
            }
          >
            <ListChecks size={11} aria-hidden="true" strokeWidth={2.5} />
            <span className="sr-only">
              {pendingProposalCount === 1
                ? "Plan proposal waiting"
                : `${pendingProposalCount} plan proposals waiting`}
            </span>
          </span>
        )}
      </div>
      {action}
    </div>
  );
});
