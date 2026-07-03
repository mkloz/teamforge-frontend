import type {
  Plan,
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { formatCountdown } from "@/features/activity/lib/chat-utils";
import type {
  GroupIndicatorChromeInput,
  GroupIndicatorState,
  GroupIndicatorVisibilityInput,
} from "./types";

export function getGroupIndicatorState({
  isCompact,
  isGroup,
  isMuted,
  isReviewWaiting,
  item,
}: {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  isReviewWaiting: boolean;
  item: UnifiedConversation;
}): GroupIndicatorState {
  const plan = getGroupPlan(item, isGroup);
  const countdown = getCountdown(plan);
  const pendingProposalCount =
    item.activeProposalCount ?? getPendingProposalCount(item);
  const hasSavedMessages = Boolean(item.savedMessageCount);
  const visibilityInput = {
    countdown,
    hasSavedMessages,
    isReviewWaiting,
    pendingProposalCount,
    plan,
  };
  const visibleGroupIndicatorCount =
    getVisibleGroupIndicatorCount(visibilityInput);
  const chromeInput = {
    isCompact,
    isGroup,
    isMuted,
    visibleGroupIndicatorCount,
  };
  const showInlineGroupIndicators =
    shouldShowInlineGroupIndicators(chromeInput);
  const hasIndicatorRow = shouldShowIndicatorRow(chromeInput);

  return {
    countdown,
    hasIndicatorRow,
    hasSavedMessages,
    pendingProposalCount,
    planStatus: countdown ? null : plan?.status,
    shouldShowSavedCountInIndicatorRow: hasIndicatorRow && hasSavedMessages,
    showInlineGroupIndicators,
  };
}

function getGroupPlan(
  item: UnifiedConversation,
  isGroup: boolean,
): Plan | null | undefined {
  return isGroup ? item.group?.plan : null;
}

function getCountdown(plan: Plan | null | undefined): string | null {
  if (plan?.status === "CONFIRMED" && plan.dateTime) {
    return formatCountdown(plan.dateTime);
  }

  return null;
}

function getVisibleGroupIndicatorCount({
  countdown,
  hasSavedMessages,
  isReviewWaiting,
  pendingProposalCount,
  plan,
}: {
  countdown: string | null;
  hasSavedMessages: boolean;
  isReviewWaiting: boolean;
  pendingProposalCount: number;
  plan: Plan | null | undefined;
}): number {
  return getVisibleGroupIndicatorFlags({
    countdown,
    hasSavedMessages,
    isReviewWaiting,
    pendingProposalCount,
    plan,
  }).filter(Boolean).length;
}

function getVisibleGroupIndicatorFlags({
  countdown,
  hasSavedMessages,
  isReviewWaiting,
  pendingProposalCount,
  plan,
}: GroupIndicatorVisibilityInput) {
  return [
    Boolean(countdown),
    Boolean(!countdown && plan?.status),
    hasSavedMessages,
    pendingProposalCount > 0,
    isReviewWaiting,
  ];
}

function canShowGroupIndicatorChrome({
  isCompact,
  isGroup,
}: {
  isCompact: boolean;
  isGroup: boolean;
}): boolean {
  return isGroup && !isCompact;
}

function shouldShowInlineGroupIndicators({
  isCompact,
  isGroup,
  isMuted,
  visibleGroupIndicatorCount,
}: GroupIndicatorChromeInput): boolean {
  return (
    canShowGroupIndicatorChrome({ isCompact, isGroup }) &&
    !isMuted &&
    visibleGroupIndicatorCount === 1
  );
}

function shouldShowIndicatorRow({
  isCompact,
  isGroup,
  isMuted,
  visibleGroupIndicatorCount,
}: GroupIndicatorChromeInput): boolean {
  return (
    canShowGroupIndicatorChrome({ isCompact, isGroup }) &&
    (visibleGroupIndicatorCount > 1 ||
      (isMuted && visibleGroupIndicatorCount > 0))
  );
}

function getPendingProposalCount(item: UnifiedConversation): number {
  if (item.kind !== "group") {
    return 0;
  }

  return getPendingProposalIds(item).size;
}

function getPendingProposalIds(item: UnifiedConversation): Set<string> {
  const pendingProposalIds = new Set(
    (item.group?.plan?.proposals ?? [])
      .filter((proposal) => proposal.status === "PENDING")
      .map((proposal) => proposal.id),
  );

  addPendingProposalId(pendingProposalIds, item.latestMessage?.proposal);

  return pendingProposalIds;
}

function addPendingProposalId(
  pendingProposalIds: Set<string>,
  proposal: UnifiedMessage["proposal"] | undefined,
) {
  if (proposal?.status === "PENDING") {
    pendingProposalIds.add(proposal.id);
  }
}
