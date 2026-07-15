import { getConversationIsMuted } from "@/features/activity/lib/unify-conversations";
import { getConversationContentState } from "./content-section-view-state/conversation-content";
import { getGroupIndicatorState } from "./content-section-view-state/group-indicators";
import { getTitleUtilityState } from "./content-section-view-state/title-utility";
import type {
  ContentSectionViewState,
  ContentSectionViewStateInput,
} from "./content-section-view-state/types";

export type { ContentSectionViewState } from "./content-section-view-state/types";

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
