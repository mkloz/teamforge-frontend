import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
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

interface HistoryTemplateActionStateInput {
  isOnline: boolean;
  isTemplateActionDisabled: boolean;
  isTemplateActionPending: boolean;
  itemId: string;
  pendingTemplateId: string | null;
}

interface PlanHistoryViewState {
  expandedPlanId: string | null;
  isExpanded: boolean;
  lastFocusRequestKey: string | null;
}

const INITIAL_PLAN_HISTORY_VIEW_STATE: PlanHistoryViewState = {
  expandedPlanId: null,
  isExpanded: false,
  lastFocusRequestKey: null,
};

function getVisibleHistoryItems(
  history: PlanHistoryItem[],
  isExpanded: boolean,
) {
  return isExpanded ? history : history.slice(0, 2);
}

function getFocusedHistoryIndex(
  history: PlanHistoryItem[],
  focusedPlanId: string | null,
) {
  return history.findIndex((item) => item.id === focusedPlanId);
}

function shouldExpandHistoryForFocusedItem(focusedHistoryIndex: number) {
  return focusedHistoryIndex > 1;
}

function getFocusRequestKey(
  focusedPlanId: string | null,
  focusedHistoryIndex: number,
  historyCount: number,
) {
  return focusedPlanId !== null && focusedHistoryIndex !== -1
    ? `${focusedPlanId}:${focusedHistoryIndex}:${historyCount}`
    : null;
}

function getExpandedPlanIdAfterListCollapse(
  history: PlanHistoryItem[],
  currentItemId: string | null,
) {
  return history.slice(0, 2).some((item) => item.id === currentItemId)
    ? currentItemId
    : null;
}

function getViewStateAfterFocusRequest({
  focusedHistoryIndex,
  focusedPlanId,
  focusRequestKey,
  state,
}: {
  focusedHistoryIndex: number;
  focusedPlanId: string | null;
  focusRequestKey: string | null;
  state: PlanHistoryViewState;
}): PlanHistoryViewState {
  if (focusedPlanId === null || focusedHistoryIndex === -1) {
    return {
      ...state,
      lastFocusRequestKey: focusRequestKey,
    };
  }

  return {
    ...state,
    expandedPlanId: focusedPlanId,
    isExpanded:
      state.isExpanded ||
      shouldExpandHistoryForFocusedItem(focusedHistoryIndex),
    lastFocusRequestKey: focusRequestKey,
  };
}

function getHistoryTemplateActionState({
  isOnline,
  isTemplateActionDisabled,
  isTemplateActionPending,
  itemId,
  pendingTemplateId,
}: HistoryTemplateActionStateInput) {
  const hasLocalTemplateAction = pendingTemplateId !== null;

  return {
    disabled:
      !isOnline ||
      isTemplateActionDisabled ||
      ((isTemplateActionPending || hasLocalTemplateAction) &&
        pendingTemplateId !== itemId),
    loading: pendingTemplateId === itemId,
  };
}

export function PlanHistorySection({
  focusedPlanId = null,
  history,
  isTemplateActionDisabled = false,
  isTemplateActionPending = false,
  isOnline = true,
  onUseAsTemplate,
}: PlanHistorySectionProps) {
  const [historyViewState, setHistoryViewState] = useState(
    INITIAL_PLAN_HISTORY_VIEW_STATE,
  );
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  );
  const historyCount = history.length;
  const focusedHistoryIndex = getFocusedHistoryIndex(history, focusedPlanId);
  const focusRequestKey = getFocusRequestKey(
    focusedPlanId,
    focusedHistoryIndex,
    historyCount,
  );
  let resolvedHistoryViewState = historyViewState;

  if (focusRequestKey !== historyViewState.lastFocusRequestKey) {
    resolvedHistoryViewState = getViewStateAfterFocusRequest({
      focusedHistoryIndex,
      focusedPlanId,
      focusRequestKey,
      state: historyViewState,
    });
    setHistoryViewState(resolvedHistoryViewState);
  }

  const { expandedPlanId, isExpanded } = resolvedHistoryViewState;
  const visibleHistory = getVisibleHistoryItems(history, isExpanded);

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
      setPendingTemplateId(null);
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't reuse that plan.",
      });
      return;
    }

    setPendingTemplateId(null);
  }

  function handleToggleHistoryItem(itemId: string) {
    setHistoryViewState((state) => ({
      ...state,
      expandedPlanId: state.expandedPlanId === itemId ? null : itemId,
    }));
  }

  function handleToggleHistoryList() {
    setHistoryViewState((state) => {
      const nextIsExpanded = !state.isExpanded;

      return {
        ...state,
        expandedPlanId: nextIsExpanded
          ? state.expandedPlanId
          : getExpandedPlanIdAfterListCollapse(history, state.expandedPlanId),
        isExpanded: nextIsExpanded,
      };
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
        {visibleHistory.map((item) => {
          const templateAction = getHistoryTemplateActionState({
            isOnline,
            isTemplateActionDisabled,
            isTemplateActionPending,
            itemId: item.id,
            pendingTemplateId,
          });

          return (
            <HistoryCard
              key={item.id}
              isExpanded={expandedPlanId === item.id}
              item={item}
              isUseAsTemplateDisabled={templateAction.disabled}
              isUseAsTemplateLoading={templateAction.loading}
              onUseAsTemplate={
                onUseAsTemplate
                  ? () => {
                      void handleUseAsTemplate(item);
                    }
                  : undefined
              }
              onToggle={() => handleToggleHistoryItem(item.id)}
            />
          );
        })}

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
