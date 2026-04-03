import { useState, useMemo } from "react";
import { History, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type {
  PlanHistoryItem,
  MemberRole,
} from "@/features/activity/types/groups.types";
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
  const isAdmin = useMemo(() => userRole === "ADMIN", [userRole]);

  // Derived visible history - only re-compute if history or expanded state changes
  const visibleHistory = useMemo(
    () => (isExpanded ? history : history.slice(0, 2)),
    [history, isExpanded],
  );

  const historyCount = useMemo(() => history.length, [history.length]);

  if (historyCount === 0 && !isAdmin) return null;

  return (
    <section aria-labelledby="history-heading">
      {/* Header with action button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-teal-600/80" />
          <h3
            id="history-heading"
            className="text-sm font-bold text-foreground uppercase tracking-widest"
          >
            History
            {historyCount > 0 && (
              <span className="ml-2 text-muted-foreground/50 font-medium">
                ({historyCount})
              </span>
            )}
          </h3>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] font-bold uppercase tracking-wider border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary rounded-lg shadow-xs transition-all duration-300"
          >
            <Plus size={13} strokeWidth={3} className="mr-1" />
            New Plan
          </Button>
        )}
      </div>

      {historyCount === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border/40 p-6 text-center bg-muted/10 group/empty hover:border-border/60 transition-colors duration-300">
          <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2.5 group-hover/empty:scale-110 transition-transform">
            <History size={18} className="text-muted-foreground/40" />
          </div>
          <p className="text-[13px] font-bold text-foreground/60 mb-0.5">
            No completed plans yet
          </p>
          <p className="text-[11px] text-muted-foreground/50 max-w-44 mx-auto leading-relaxed">
            Past activities will appear here once your group completes its first
            forge.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleHistory.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}

          {/* Expand/collapse button - standardized style */}
          {historyCount > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg",
                "text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all",
              )}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} strokeWidth={2.5} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={12} strokeWidth={2.5} />
                  See {historyCount - 2} more
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
