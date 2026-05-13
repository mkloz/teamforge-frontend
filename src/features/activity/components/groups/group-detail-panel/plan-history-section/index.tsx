import { CalendarCheck2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { HistoryCard } from "./history-card";

interface PlanHistorySectionProps {
  groupId: string;
  history: PlanHistoryItem[];
}

export function PlanHistorySection({
  groupId,
  history,
}: PlanHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleHistory = isExpanded ? history : history.slice(0, 2);
  const historyCount = history.length;

  if (historyCount === 0) return null;

  return (
    <section aria-labelledby="previous-plans-heading">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-forge-teal" />
          <div className="min-w-0">
            <h3
              id="previous-plans-heading"
              className="font-bold text-foreground text-sm"
            >
              Previous plans
            </h3>
            <p className="mt-1 text-slate-muted text-xs leading-relaxed">
              {historyCount === 1
                ? "1 past plan from this group."
                : `${historyCount} past plans from this group.`}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/70 border-border/70 border-y">
        {visibleHistory.map((item) => (
          <HistoryCard key={item.id} groupId={groupId} item={item} />
        ))}

        {historyCount > 2 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn("h-auto w-full gap-1.5 py-2.5", "text-xs")}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" strokeWidth={2.5} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" strokeWidth={2.5} />
                See {historyCount - 2} more
              </>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
