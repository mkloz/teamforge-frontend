import { useState } from "react";
import { History, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type {
  PlanHistoryItem,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { HistoryCard } from "./history-card";

interface PlanHistorySectionProps {
  history: PlanHistoryItem[];
  userRole: MemberRole;
}

export function PlanHistorySection({
  history,
  userRole,
}: PlanHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAdmin = userRole === "ADMIN";
  const visibleHistory = isExpanded ? history : history.slice(0, 2);
  const historyCount = history.length;

  if (historyCount === 0 && !isAdmin) return null;

  return (
    <section aria-labelledby="history-heading">
      {/* Header with action button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-forge-teal/80" />
          <h3
            id="history-heading"
            className="text-sm font-bold tracking-widest text-foreground uppercase"
          >
            History
            {historyCount > 0 && (
              <span className="ml-2 font-medium text-muted-foreground/50">
                ({historyCount})
              </span>
            )}
          </h3>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider uppercase"
          >
            <Plus className="mr-1 size-3.5" strokeWidth={3} />
            New Plan
          </Button>
        )}
      </div>

      {historyCount === 0 ? (
        <div className="group/empty rounded-xl border-2 border-dashed border-border/40 bg-muted/10 p-6 text-center transition-colors duration-300 hover:border-border/60">
          <div className="mx-auto mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted/30 transition-transform group-hover/empty:scale-110">
            <History className="size-5 text-muted-foreground/40" />
          </div>
          <p className="mb-0.5 text-sm font-bold text-foreground/60">
            No completed plans yet
          </p>
          <p className="mx-auto max-w-44 text-xs leading-relaxed text-muted-foreground/50">
            Past activities will appear here once your group completes its first
            forge.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visibleHistory.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}

          {/* Expand/collapse button - standardized style */}
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
      )}
    </section>
  );
}
