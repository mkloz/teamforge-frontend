import { Bookmark, Clock, UserStar, Vote } from "lucide-react";
import type { ReactNode } from "react";
import { StatusPill } from "@/shared/components/ui/status-pill";

const counterBadgeClassName = "h-3.5 min-w-3.5 px-1";
const iconOnlyBadgeClassName = "size-3.5 min-w-0 p-0";
const indicatorIconClassName = "size-2";

interface GroupIndicatorsProps {
  action?: ReactNode;
  countdown?: string | null;
  pendingProposalCount?: number;
  savedMessageCount?: number;
  isReviewWaiting?: boolean;
  variant?: "inline" | "row";
}

interface GroupIndicatorsViewState {
  hasAnything: boolean;
  hasPendingProposal: boolean;
  hasSavedMessages: boolean;
  pendingProposalLabel: string;
}

export function GroupIndicators({
  action,
  countdown,
  pendingProposalCount = 0,
  savedMessageCount = 0,
  isReviewWaiting = false,
  variant = "row",
}: GroupIndicatorsProps) {
  const viewState = getGroupIndicatorsViewState({
    action,
    countdown,
    isReviewWaiting,
    pendingProposalCount,
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
      <div className="flex min-w-0 items-center gap-1">{indicators}</div>
      {action}
    </div>
  );
}

function getGroupIndicatorsViewState({
  action,
  countdown,
  isReviewWaiting,
  pendingProposalCount,
  savedMessageCount,
}: Pick<
  GroupIndicatorsProps,
  | "action"
  | "countdown"
  | "isReviewWaiting"
  | "pendingProposalCount"
  | "savedMessageCount"
>): GroupIndicatorsViewState {
  const hasPendingProposal = (pendingProposalCount ?? 0) > 0;
  const hasSavedMessages = (savedMessageCount ?? 0) > 0;

  return {
    hasAnything: hasVisibleGroupIndicator({
      countdown,
      hasPendingProposal,
      hasSavedMessages,
      isReviewWaiting,
      action,
    }),
    hasPendingProposal,
    hasSavedMessages,
    pendingProposalLabel: getPendingProposalLabel(pendingProposalCount ?? 0),
  };
}

function hasVisibleGroupIndicator({
  countdown,
  hasPendingProposal,
  hasSavedMessages,
  isReviewWaiting,
  action,
}: Pick<GroupIndicatorsViewState, "hasPendingProposal" | "hasSavedMessages"> &
  Pick<GroupIndicatorsProps, "action" | "countdown" | "isReviewWaiting">) {
  return [
    countdown,
    hasPendingProposal,
    hasSavedMessages,
    isReviewWaiting,
    action,
  ].some(Boolean);
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
      numeric
    >
      {countdown}
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
      numeric
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
      numeric
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
      className={iconOnlyBadgeClassName}
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
