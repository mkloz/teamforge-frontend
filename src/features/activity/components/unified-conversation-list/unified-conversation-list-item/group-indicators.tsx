import { Clock, FileEdit } from "lucide-react";
import { memo } from "react";

interface GroupIndicatorsProps {
  countdown?: string | null;
  isDraft?: boolean;
}

export const GroupIndicators = memo(function GroupIndicators({
  countdown,
  isDraft,
}: GroupIndicatorsProps) {
  const hasAnything = !!(countdown || isDraft);
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
    </div>
  );
});
