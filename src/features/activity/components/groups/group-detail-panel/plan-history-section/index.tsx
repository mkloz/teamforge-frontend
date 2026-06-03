import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { HistoryCard } from "./history-card";

interface PlanHistorySectionProps {
  focusedPlanId?: string | null;
  history: PlanHistoryItem[];
  isTemplateActionDisabled?: boolean;
  isTemplateActionPending?: boolean;
  isOnline?: boolean;
  onUseAsTemplate?: (item: PlanHistoryItem) => Promise<void> | void;
}

export function PlanHistorySection({
  focusedPlanId = null,
  history,
  isTemplateActionDisabled = false,
  isTemplateActionPending = false,
  isOnline = true,
  onUseAsTemplate,
}: PlanHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  );
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(
    focusedPlanId,
  );
  const visibleHistory = isExpanded ? history : history.slice(0, 2);
  const historyCount = history.length;
  const hasLocalTemplateAction = pendingTemplateId !== null;

  useEffect(() => {
    const focusedHistoryIndex = history.findIndex(
      (item) => item.id === focusedPlanId,
    );

    if (focusedHistoryIndex === -1) {
      return;
    }

    setExpandedPlanId(focusedPlanId);

    if (focusedHistoryIndex > 1) {
      setIsExpanded(true);
    }
  }, [focusedPlanId, history]);

  if (historyCount === 0) return null;

  async function handleUseAsTemplate(item: PlanHistoryItem) {
    if (!onUseAsTemplate) {
      return;
    }

    if (!isOnline) {
      return;
    }

    setPendingTemplateId(item.id);

    try {
      await onUseAsTemplate(item);
      showAppSuccessToast("Plan copied into a new draft.", {
        id: "plan-template-copied",
      });
    } catch (error) {
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't reuse that plan.",
      });
    } finally {
      setPendingTemplateId(null);
    }
  }

  function handleToggleHistoryItem(itemId: string) {
    setExpandedPlanId((currentItemId) =>
      currentItemId === itemId ? null : itemId,
    );
  }

  function handleToggleHistoryList() {
    setIsExpanded((currentIsExpanded) => {
      const nextIsExpanded = !currentIsExpanded;

      if (!nextIsExpanded) {
        setExpandedPlanId((currentItemId) =>
          history.slice(0, 2).some((item) => item.id === currentItemId)
            ? currentItemId
            : null,
        );
      }

      return nextIsExpanded;
    });
  }

  return (
    <section aria-labelledby="previous-plans-heading">
      <div className="mb-3 flex flex-col gap-1">
        <h3
          id="previous-plans-heading"
          className="font-bold text-foreground text-sm"
        >
          Previous plans{" "}
          <span className="ml-1 font-medium text-muted-foreground/60">
            ({historyCount})
          </span>
        </h3>
        <p className="text-slate-muted text-xs leading-relaxed">
          Completed and cancelled plans from this group.
        </p>
        {!isOnline ? (
          <p role="status" className="text-slate-muted text-xs">
            Reconnect before reusing a previous plan.
          </p>
        ) : null}
      </div>

      <div className="divide-y divide-border/70 border-border/70 border-y">
        {visibleHistory.map((item) => (
          <HistoryCard
            key={item.id}
            isExpanded={expandedPlanId === item.id}
            item={item}
            isUseAsTemplateDisabled={
              !isOnline ||
              isTemplateActionDisabled ||
              ((isTemplateActionPending || hasLocalTemplateAction) &&
                pendingTemplateId !== item.id)
            }
            isUseAsTemplateLoading={pendingTemplateId === item.id}
            onUseAsTemplate={
              onUseAsTemplate
                ? () => {
                    void handleUseAsTemplate(item);
                  }
                : undefined
            }
            onToggle={() => handleToggleHistoryItem(item.id)}
          />
        ))}

        {historyCount > 2 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleToggleHistoryList}
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
