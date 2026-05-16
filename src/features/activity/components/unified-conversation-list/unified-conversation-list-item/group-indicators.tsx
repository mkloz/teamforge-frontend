import { Clock, FileEdit } from "lucide-react";
import { memo, type ReactNode } from "react";

interface GroupIndicatorsProps {
  action?: ReactNode;
  countdown?: string | null;
  isDraft?: boolean;
}

export const GroupIndicators = memo(function GroupIndicators({
  action,
  countdown,
  isDraft,
}: GroupIndicatorsProps) {
  const hasAnything = !!(countdown || isDraft || action);
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
          <span className="flex items-center gap-1 font-bold text-micro text-spark-amber">
            <FileEdit size={11} strokeWidth={2.5} />
            Pending
          </span>
        )}
      </div>
      {action}
    </div>
  );
});
