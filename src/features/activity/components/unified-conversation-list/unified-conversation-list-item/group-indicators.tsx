import { Bookmark, Clock, Vote } from "lucide-react";
import { memo, type ReactNode } from "react";
import { PLAN_STATUS_CONFIG } from "@/features/activity/components/chat/unified-conversation-view/chat-status-bar/chat-status-plan-config";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";

const counterBadgeClassName = "min-w-5";
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
        <StatusPill
          icon={Clock}
          iconClassName={indicatorIconClassName}
          iconStrokeWidth={2.2}
          tone="teal"
          size="signature"
          surface="soft"
          className={counterBadgeClassName}
        >
          {countdown}
        </StatusPill>
      )}
      {PlanStatusIcon && planStatusConfig && (
        <IconTile
          aria-hidden={false}
          size="2xs"
          shape="circle"
          tone="none"
          className={planStatusConfig.badgeClass}
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
        </IconTile>
      )}
      {hasSavedMessages && (
        <StatusPill
          icon={Bookmark}
          iconClassName={`${indicatorIconClassName} fill-forge-teal/15`}
          iconStrokeWidth={2.2}
          tone="teal"
          size="signature"
          surface="soft"
          className={counterBadgeClassName}
        >
          {savedMessageCount}
        </StatusPill>
      )}
      {hasPendingProposal && (
        <StatusPill
          icon={Vote}
          iconClassName={indicatorIconClassName}
          iconStrokeWidth={2.2}
          tone="amber"
          size="signature"
          surface="soft"
          className={counterBadgeClassName}
          title={
            pendingProposalCount === 1
              ? "Plan proposal needs your vote"
              : `${pendingProposalCount} plan proposals need your vote`
          }
        >
          {pendingProposalCount}
          <span className="sr-only">
            {pendingProposalCount === 1
              ? "Plan proposal needs your vote"
              : `${pendingProposalCount} plan proposals need your vote`}
          </span>
        </StatusPill>
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
