import type {
  Plan,
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export interface ContentSectionViewStateInput {
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

export interface ConversationContentState {
  formattedTimestamp: string;
  isNotes: boolean;
  latestMessage: UnifiedMessage | undefined;
  previewMessage: UnifiedMessage | undefined;
  subtitle: string;
  title: string;
}

export interface GroupIndicatorState {
  countdown: string | null;
  hasIndicatorRow: boolean;
  hasSavedMessages: boolean;
  pendingProposalCount: number;
  planStatus: Plan["status"] | null | undefined;
  shouldShowSavedCountInIndicatorRow: boolean;
  showInlineGroupIndicators: boolean;
}

export interface GroupIndicatorVisibilityInput {
  countdown: string | null;
  hasSavedMessages: boolean;
  isReviewWaiting: boolean;
  pendingProposalCount: number;
  plan: Plan | null | undefined;
}

export interface GroupIndicatorChromeInput {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  visibleGroupIndicatorCount: number;
}

export interface TitleUtilityState {
  hasTitleUtilityCluster: boolean;
  showInlineMutedIndicator: boolean;
  showStaticPinnedIcon: boolean;
  showTitlePinButton: boolean;
}
