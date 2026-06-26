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

interface ConversationContentState {
  formattedTimestamp: string;
  isNotes: boolean;
  latestMessage: UnifiedMessage | undefined;
  previewMessage: UnifiedMessage | undefined;
  subtitle: string;
  title: string;
}

interface GroupIndicatorState {
  countdown: string | null;
  hasIndicatorRow: boolean;
  hasSavedMessages: boolean;
  pendingProposalCount: number;
  planStatus: Plan["status"] | null | undefined;
  shouldShowSavedCountInIndicatorRow: boolean;
  showInlineGroupIndicators: boolean;
}

interface GroupIndicatorVisibilityInput {
  countdown: string | null;
  hasSavedMessages: boolean;
  isReviewWaiting: boolean;
  pendingProposalCount: number;
  plan: Plan | null | undefined;
}

interface GroupIndicatorChromeInput {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  visibleGroupIndicatorCount: number;
}

interface TitleUtilityState {
  hasTitleUtilityCluster: boolean;
  showInlineMutedIndicator: boolean;
  showStaticPinnedIcon: boolean;
  showTitlePinButton: boolean;
}

export function getContentSectionViewState({
  hasTogglePinned,
  isCompact,
  isGroup,
  isReviewWaiting,
  isSavedView,
  item,
}: ContentSectionViewStateInput): ContentSectionViewState {
  const isMuted = getConversationIsMuted(item);
  const contentState = getConversationContentState({ isSavedView, item });
  const groupIndicatorState = getGroupIndicatorState({
    isCompact,
    isGroup,
    isMuted,
    isReviewWaiting,
    item,
  });
  const titleUtilityState = getTitleUtilityState({
    hasTogglePinned,
    isPinned: item.isPinned,
    isMuted,
    showInlineGroupIndicators: groupIndicatorState.showInlineGroupIndicators,
  });

  return {
    countdown: groupIndicatorState.countdown,
    formattedTimestamp: contentState.formattedTimestamp,
    hasIndicatorRow: groupIndicatorState.hasIndicatorRow,
    hasSavedMessages: groupIndicatorState.hasSavedMessages,
    hasTitleUtilityCluster: titleUtilityState.hasTitleUtilityCluster,
    hasUnread: item.unreadCount > 0,
    isMuted,
    isNotes: contentState.isNotes,
    latestMessage: contentState.latestMessage,
    pendingProposalCount: groupIndicatorState.pendingProposalCount,
    planStatus: groupIndicatorState.planStatus,
    previewMessage: contentState.previewMessage,
    shouldShowSavedCountInIndicatorRow:
      groupIndicatorState.shouldShowSavedCountInIndicatorRow,
    showInlineGroupIndicators: groupIndicatorState.showInlineGroupIndicators,
    showInlineMutedIndicator: titleUtilityState.showInlineMutedIndicator,
    showStaticPinnedIcon: titleUtilityState.showStaticPinnedIcon,
    showTitlePinButton: titleUtilityState.showTitlePinButton,
    subtitle: contentState.subtitle,
    title: contentState.title,
  };
}

function getConversationContentState({
  isSavedView,
  item,
}: {
  isSavedView: boolean;
  item: UnifiedConversation;
}): ConversationContentState {
  const previewMessage = getPreviewMessage(item, isSavedView);
  const timestampMessage = getTimestampMessage({
    isSavedView,
    item,
    previewMessage,
  });

  return {
    formattedTimestamp: timestampMessage?.createdAt
      ? formatRelativeTime(timestampMessage.createdAt)
      : "",
    isNotes: getConversationIsNotes(item),
    latestMessage: item.latestMessage,
    previewMessage,
    subtitle: getSubtitle(item, isSavedView),
    title: getConversationTitle(item),
  };
}

function getGroupIndicatorState({
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

function getTitleUtilityState({
  hasTogglePinned,
  isPinned,
  isMuted,
  showInlineGroupIndicators,
}: {
  hasTogglePinned: boolean;
  isPinned: boolean | undefined;
  isMuted: boolean;
  showInlineGroupIndicators: boolean;
}): TitleUtilityState {
  const showInlineMutedIndicator = isMuted;
  const showStaticPinnedIcon = Boolean(isPinned);
  const showTitlePinButton = shouldShowTitlePinButton({
    hasTogglePinned,
    isPinned,
    showInlineGroupIndicators,
    showInlineMutedIndicator,
  });

  return {
    hasTitleUtilityCluster: [
      showInlineGroupIndicators,
      showInlineMutedIndicator,
      showTitlePinButton,
      showStaticPinnedIcon,
    ].some(Boolean),
    showInlineMutedIndicator,
    showStaticPinnedIcon,
    showTitlePinButton,
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
