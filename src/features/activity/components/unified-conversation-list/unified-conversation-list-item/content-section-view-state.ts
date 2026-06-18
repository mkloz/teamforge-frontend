import type {
  Plan,
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import {
  formatCountdown,
  formatRelativeTime,
} from "@/features/activity/lib/chat-utils";
import {
  getConversationIsMuted,
  getConversationIsNotes,
  getConversationSubtitle,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";

interface ContentSectionViewStateInput {
  hasTogglePinned: boolean;
  isCompact: boolean;
  isGroup: boolean;
  isReviewWaiting: boolean;
  isSavedView: boolean;
  item: UnifiedConversation;
}

export interface ContentSectionViewState {
  countdown: string | null;
  formattedTimestamp: string;
  hasIndicatorRow: boolean;
  hasSavedMessages: boolean;
  hasTitleUtilityCluster: boolean;
  hasUnread: boolean;
  isMuted: boolean;
  isNotes: boolean;
  latestMessage: UnifiedMessage | undefined;
  pendingProposalCount: number;
  planStatus: Plan["status"] | null | undefined;
  previewMessage: UnifiedMessage | undefined;
  shouldShowSavedCountInIndicatorRow: boolean;
  showInlineGroupIndicators: boolean;
  showInlineMutedIndicator: boolean;
  showStaticPinnedIcon: boolean;
  showTitlePinButton: boolean;
  subtitle: string;
  title: string;
}

export function getContentSectionViewState({
  hasTogglePinned,
  isCompact,
  isGroup,
  isReviewWaiting,
  isSavedView,
  item,
}: ContentSectionViewStateInput): ContentSectionViewState {
  const previewMessage = getPreviewMessage(item, isSavedView);
  const subtitle = getSubtitle(item, isSavedView);
  const plan = getGroupPlan(item, isGroup);
  const countdown = getCountdown(plan);
  const pendingProposalCount =
    item.activeProposalCount ?? getPendingProposalCount(item);
  const hasSavedMessages = Boolean(item.savedMessageCount);
  const visibleGroupIndicatorCount = getVisibleGroupIndicatorCount({
    countdown,
    hasSavedMessages,
    isReviewWaiting,
    pendingProposalCount,
    plan,
  });
  const isMuted = getConversationIsMuted(item);
  const showInlineGroupIndicators = shouldShowInlineGroupIndicators({
    isCompact,
    isGroup,
    isMuted,
    visibleGroupIndicatorCount,
  });
  const hasIndicatorRow = shouldShowIndicatorRow({
    isCompact,
    isGroup,
    isMuted,
    visibleGroupIndicatorCount,
  });
  const showInlineMutedIndicator = isMuted;
  const showTitlePinButton = shouldShowTitlePinButton({
    hasTogglePinned,
    isPinned: item.isPinned,
    showInlineGroupIndicators,
    showInlineMutedIndicator,
  });
  const showStaticPinnedIcon = Boolean(item.isPinned);
  const timestampMessage = getTimestampMessage({
    isSavedView,
    item,
    previewMessage,
  });

  return {
    countdown,
    formattedTimestamp: timestampMessage?.createdAt
      ? formatRelativeTime(timestampMessage.createdAt)
      : "",
    hasIndicatorRow,
    hasSavedMessages,
    hasTitleUtilityCluster:
      showInlineGroupIndicators ||
      showInlineMutedIndicator ||
      showTitlePinButton ||
      showStaticPinnedIcon,
    hasUnread: item.unreadCount > 0,
    isMuted,
    isNotes: getConversationIsNotes(item),
    latestMessage: item.latestMessage,
    pendingProposalCount,
    planStatus: countdown ? null : plan?.status,
    previewMessage,
    shouldShowSavedCountInIndicatorRow: hasIndicatorRow && hasSavedMessages,
    showInlineGroupIndicators,
    showInlineMutedIndicator,
    showStaticPinnedIcon,
    showTitlePinButton,
    subtitle,
    title: getConversationTitle(item),
  };
}

function getPreviewMessage(
  item: UnifiedConversation,
  isSavedView: boolean,
): UnifiedMessage | undefined {
  if (isSavedView && item.latestSavedMessage) {
    return item.latestSavedMessage;
  }

  return item.latestMessage;
}

function getSubtitle(item: UnifiedConversation, isSavedView: boolean): string {
  if (isSavedView && item.latestSavedMessage) {
    return getMessagePreviewText(item.latestSavedMessage);
  }

  return getConversationSubtitle(item);
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
  const hasCountdownIndicator = Boolean(countdown);
  const hasPlanStatusIndicator = Boolean(!countdown && plan?.status);
  const hasPendingProposal = pendingProposalCount > 0;

  return (
    Number(hasCountdownIndicator) +
    Number(hasPlanStatusIndicator) +
    Number(hasSavedMessages) +
    Number(hasPendingProposal) +
    Number(isReviewWaiting)
  );
}

function shouldShowInlineGroupIndicators({
  isCompact,
  isGroup,
  isMuted,
  visibleGroupIndicatorCount,
}: {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  visibleGroupIndicatorCount: number;
}): boolean {
  return isGroup && !isCompact && !isMuted && visibleGroupIndicatorCount === 1;
}

function shouldShowIndicatorRow({
  isCompact,
  isGroup,
  isMuted,
  visibleGroupIndicatorCount,
}: {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  visibleGroupIndicatorCount: number;
}): boolean {
  return (
    isGroup &&
    !isCompact &&
    (visibleGroupIndicatorCount > 1 ||
      (isMuted && visibleGroupIndicatorCount > 0))
  );
}

function shouldShowTitlePinButton({
  hasTogglePinned,
  isPinned,
  showInlineGroupIndicators,
  showInlineMutedIndicator,
}: {
  hasTogglePinned: boolean;
  isPinned: boolean | undefined;
  showInlineGroupIndicators: boolean;
  showInlineMutedIndicator: boolean;
}): boolean {
  return (
    hasTogglePinned &&
    !isPinned &&
    (showInlineMutedIndicator || showInlineGroupIndicators)
  );
}

function getTimestampMessage({
  isSavedView,
  item,
  previewMessage,
}: {
  isSavedView: boolean;
  item: UnifiedConversation;
  previewMessage: UnifiedMessage | undefined;
}): UnifiedMessage | undefined {
  return isSavedView ? previewMessage : item.latestMessage;
}

function getPendingProposalCount(item: UnifiedConversation): number {
  if (item.kind !== "group") {
    return 0;
  }

  const pendingProposalIds = new Set(
    (item.group?.plan?.proposals ?? [])
      .filter((proposal) => proposal.status === "PENDING")
      .map((proposal) => proposal.id),
  );
  const latestProposal = item.latestMessage?.proposal;

  if (latestProposal?.status === "PENDING") {
    pendingProposalIds.add(latestProposal.id);
  }

  return pendingProposalIds.size;
}
