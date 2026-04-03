import { Clock, FileEdit } from "lucide-react";
import { memo } from "react";

interface GroupIndicatorsProps {
  countdown?: string | null;
  isDraft?: boolean;
  pendingProposals?: number;
}

export const GroupIndicators = memo(function GroupIndicators({
  countdown,
  isDraft,
  pendingProposals = 0,
}: GroupIndicatorsProps) {
  const hasAnything = !!(countdown || isDraft || pendingProposals > 0);
  if (!hasAnything) return null;

  return (
    <div className="flex items-center gap-2.5 mt-2">
      {countdown && (
        <span className="flex items-center gap-1 text-micro font-bold text-forge-teal/80">
          <Clock size={11} strokeWidth={2.5} />
          {countdown}
        </span>
      )}
      {isDraft && (
        <span className="flex items-center gap-1 text-micro font-bold text-spark-amber">
          <FileEdit size={11} strokeWidth={2.5} />
          Pending
        </span>
      )}
      {pendingProposals > 0 && (
        <span className="text-micro font-black text-spark-amber tracking-tight">
          {pendingProposals} proposal{pendingProposals !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
});
