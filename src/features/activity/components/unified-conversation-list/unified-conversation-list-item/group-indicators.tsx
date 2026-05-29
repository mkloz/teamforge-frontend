import { Bookmark, Clock, Vote } from "lucide-react";
import { memo, type ReactNode } from "react";
import { PLAN_STATUS_CONFIG } from "@/features/activity/components/chat/unified-conversation-view/chat-status-bar/chat-status-plan-config";
import type { Plan } from "@/features/activity/lib/activity-contract";

const counterBadgeClassName =
  "type-signature-label inline-flex h-4 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 font-bold leading-none";
const iconBadgeClassName =
  "inline-flex size-4 shrink-0 items-center justify-center rounded-full";
const indicatorIconClassName = "size-2.5";

interface GroupIndicatorsProps {
  action?: ReactNode;
  countdown?: string | null;
  pendingProposalCount?: number;
  planStatus?: Plan["status"] | null;
  savedMessageCount?: number;
  variant?: "inline" | "row";
}

export const GroupIndicators = memo(function GroupIndicators({
  action,
  countdown,
  pendingProposalCount = 0,
  planStatus,
  savedMessageCount = 0,
  variant = "row",
}: GroupIndicatorsProps) {
  const hasPendingProposal = pendingProposalCount > 0;
  const planStatusConfig =
    !countdown && planStatus ? PLAN_STATUS_CONFIG[planStatus] : null;
  const PlanStatusIcon = planStatusConfig?.icon;
  const hasSavedMessages = savedMessageCount > 0;
  const hasAnything = !!(
    countdown ||
    planStatusConfig ||
    hasPendingProposal ||
    hasSavedMessages ||
    action
  );
  if (!hasAnything) return null;

  const indicators = (
    <>
      {countdown && (
        <span
          className={`${counterBadgeClassName} bg-forge-teal/8 text-forge-teal`}
        >
          <Clock
            aria-hidden="true"
            className={indicatorIconClassName}
            strokeWidth={2.2}
          />
          {countdown}
        </span>
      )}
      {PlanStatusIcon && planStatusConfig && (
        <span
          className={`${iconBadgeClassName} ${planStatusConfig.badgeClass}`}
          title={`Plan ${planStatusConfig.label.toLowerCase()}`}
        >
          <PlanStatusIcon
            aria-hidden="true"
            className={indicatorIconClassName}
            strokeWidth={2.2}
          />
          <span className="sr-only">
            Plan {planStatusConfig.label.toLowerCase()}
          </span>
        </span>
      )}
      {hasSavedMessages && (
        <span
          className={`${counterBadgeClassName} bg-forge-teal/8 text-forge-teal`}
        >
          <Bookmark
            className={`${indicatorIconClassName} fill-forge-teal/15`}
            strokeWidth={2.2}
          />
          {savedMessageCount}
        </span>
      )}
      {hasPendingProposal && (
        <span
          className={`${counterBadgeClassName} bg-spark-amber/12 text-spark-amber`}
          title={
            pendingProposalCount === 1
              ? "Plan proposal needs your vote"
              : `${pendingProposalCount} plan proposals need your vote`
          }
        >
          <Vote
            aria-hidden="true"
            className={indicatorIconClassName}
            strokeWidth={2.2}
          />
          {pendingProposalCount}
          <span className="sr-only">
            {pendingProposalCount === 1
              ? "Plan proposal needs your vote"
              : `${pendingProposalCount} plan proposals need your vote`}
          </span>
        </span>
      )}
    </>
  );

  if (variant === "inline") {
    return indicators;
  }

  return (
    <div className="mt-0.5 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">{indicators}</div>
      {action}
    </div>
  );
});
