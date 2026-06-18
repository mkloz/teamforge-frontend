import { Bookmark, Clock, UserStar, Vote } from "lucide-react";
import { memo, type ReactNode } from "react";
import { PLAN_STATUS_CONFIG } from "@/features/activity/components/chat/unified-conversation-view/chat-status-bar/chat-status-plan-config";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

const counterBadgeClassName = "min-w-5";
const indicatorIconClassName = "size-2.5";

interface GroupIndicatorsProps {
  action?: ReactNode;
  countdown?: string | null;
  pendingProposalCount?: number;
  planStatus?: Plan["status"] | null;
  savedMessageCount?: number;
  isReviewWaiting?: boolean;
  variant?: "inline" | "row";
}

interface GroupIndicatorsViewState {
  hasAnything: boolean;
  hasPendingProposal: boolean;
  hasSavedMessages: boolean;
  pendingProposalLabel: string;
  planStatusConfig: (typeof PLAN_STATUS_CONFIG)[Plan["status"]] | null;
}

export const GroupIndicators = memo(function GroupIndicators({
  action,
  countdown,
  pendingProposalCount = 0,
  planStatus,
  savedMessageCount = 0,
  isReviewWaiting = false,
  variant = "row",
}: GroupIndicatorsProps) {
  const viewState = getGroupIndicatorsViewState({
    action,
    countdown,
    isReviewWaiting,
    pendingProposalCount,
    planStatus,
    savedMessageCount,
  });

  if (!viewState.hasAnything) return null;

  const indicators = (
    <GroupIndicatorPills
      countdown={countdown}
      isReviewWaiting={isReviewWaiting}
      pendingProposalCount={pendingProposalCount}
      savedMessageCount={savedMessageCount}
      viewState={viewState}
    />
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

function getGroupIndicatorsViewState({
  action,
  countdown,
  isReviewWaiting,
  pendingProposalCount,
  planStatus,
  savedMessageCount,
}: Pick<
  GroupIndicatorsProps,
  | "action"
  | "countdown"
  | "isReviewWaiting"
  | "pendingProposalCount"
  | "planStatus"
  | "savedMessageCount"
>): GroupIndicatorsViewState {
  const hasPendingProposal = (pendingProposalCount ?? 0) > 0;
  const hasSavedMessages = (savedMessageCount ?? 0) > 0;
  const planStatusConfig =
    !countdown && planStatus ? PLAN_STATUS_CONFIG[planStatus] : null;

  return {
    hasAnything: !!(
      countdown ||
      planStatusConfig ||
      hasPendingProposal ||
      hasSavedMessages ||
      isReviewWaiting ||
      action
    ),
    hasPendingProposal,
    hasSavedMessages,
    pendingProposalLabel: getPendingProposalLabel(pendingProposalCount ?? 0),
    planStatusConfig,
  };
}

function GroupIndicatorPills({
  countdown,
  isReviewWaiting,
  pendingProposalCount,
  savedMessageCount,
  viewState,
}: {
  countdown: string | null | undefined;
  isReviewWaiting: boolean;
  pendingProposalCount: number;
  savedMessageCount: number;
  viewState: GroupIndicatorsViewState;
}) {
  return (
    <>
      <CountdownIndicator countdown={countdown} />
      <PlanStatusIndicator planStatusConfig={viewState.planStatusConfig} />
      <SavedMessagesIndicator
        count={savedMessageCount}
        isVisible={viewState.hasSavedMessages}
      />
      <PendingProposalIndicator
        count={pendingProposalCount}
        isVisible={viewState.hasPendingProposal}
        label={viewState.pendingProposalLabel}
      />
      <ReviewWaitingIndicator isVisible={isReviewWaiting} />
    </>
  );
}

function CountdownIndicator({
  countdown,
}: {
  countdown: string | null | undefined;
}) {
  if (!countdown) {
    return null;
  }

  return (
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
  );
}

function PlanStatusIndicator({
  planStatusConfig,
}: {
  planStatusConfig: GroupIndicatorsViewState["planStatusConfig"];
}) {
  const PlanStatusIcon = planStatusConfig?.icon;

  if (!PlanStatusIcon || !planStatusConfig) {
    return null;
  }

  return (
    <StatusPill
      icon={PlanStatusIcon}
      iconClassName={indicatorIconClassName}
      iconStrokeWidth={2.2}
      tone="none"
      size="signature"
      surface="soft"
      className={cn(counterBadgeClassName, planStatusConfig.badgeClass)}
      title={`Plan ${planStatusConfig.label.toLowerCase()}`}
    >
      <span className="sr-only">
        Plan {planStatusConfig.label.toLowerCase()}
      </span>
    </StatusPill>
  );
}

function SavedMessagesIndicator({
  count,
  isVisible,
}: {
  count: number;
  isVisible: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <StatusPill
      icon={Bookmark}
      iconClassName={`${indicatorIconClassName} fill-forge-teal/15`}
      iconStrokeWidth={2.2}
      tone="teal"
      size="signature"
      surface="soft"
      className={counterBadgeClassName}
    >
      {count}
    </StatusPill>
  );
}

function PendingProposalIndicator({
  count,
  isVisible,
  label,
}: {
  count: number;
  isVisible: boolean;
  label: string;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <StatusPill
      icon={Vote}
      iconClassName={indicatorIconClassName}
      iconStrokeWidth={2.2}
      tone="amber"
      size="signature"
      surface="soft"
      className={counterBadgeClassName}
      title={label}
    >
      {count}
      <span className="sr-only">{label}</span>
    </StatusPill>
  );
}

function ReviewWaitingIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <StatusPill
      icon={UserStar}
      iconClassName={indicatorIconClassName}
      iconStrokeWidth={2.2}
      tone="amber"
      size="signature"
      surface="soft"
      className={counterBadgeClassName}
      title="Review checkpoint"
    >
      <span className="sr-only">Review checkpoint</span>
    </StatusPill>
  );
}

function getPendingProposalLabel(count: number) {
  return count === 1
    ? "Plan proposal needs your vote"
    : `${count} plan proposals need your vote`;
}
