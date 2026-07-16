import { useRef, useState } from "react";
import { getConversationCapabilities } from "@/features/activity/components/conversation-workspace/conversation-capability-context";
import {
  getConversationViewState,
  getSearchResultLabel,
} from "@/features/activity/components/conversation-workspace/conversation-view-state";
import {
  getActiveConversationSearchQuery,
  getNextConversationSearchState,
} from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-search-state";
import type {
  ConversationSearchState,
  ConversationWorkspaceProps,
} from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";
import {
  createPinnedMessageUnpinHandler,
  getConversationComposerGroup,
  getConversationDataProps,
  getConversationStatusBarPlan,
  getStatusBarDetailsHandler,
} from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace-helpers";
import {
  canOpenPlanProposalDialog,
  createOpenProposalDialogHandler,
} from "@/features/activity/components/conversation-workspace/conversation-workspace/plan-proposal-dialog-state";
import type { MessageScrollHandle } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll.types";
import { useConversationMessageSearch } from "@/features/activity/components/conversation-workspace/use-conversation-message-search";
import { useConversationMessageSelection } from "@/features/activity/components/conversation-workspace/use-conversation-message-selection";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useConversationData } from "@/features/activity/hooks/use-conversation-data";

export type ConversationWorkspaceController = ReturnType<
  typeof useConversationWorkspaceController
>;

export function useConversationWorkspaceController(
  props: ConversationWorkspaceProps,
) {
  const {
    messages,
    isTyping = false,
    firstUnreadMessageId = null,
    typingUsers = [],
    isActionOpen = false,
    focusedMessageId,
    isLoadingMessages = false,
    isMessageError = false,
    isOnline = true,
    messageScrollHandleRef,
    openHeaderDetailsInPanel = false,
    sendError = null,
    hasOlderMessages = false,
    isLoadingOlderMessages = false,
    onBack,
    onClearSendError,
    onLoadOlderMessages,
    onRetryMessages,
    onShowParticipantProfile,
    onToggleAction,
    onViewPlan,
    onSendMessage,
  } = props;
  const { kind } = props;
  const {
    activePlan,
    allPinnedMessages,
    chatId,
    conversationId,
    inputPlaceholder,
    isBlockedDirectChat,
    isNotesChat,
  } = getConversationViewState(props);
  const [searchState, setSearchState] = useState<ConversationSearchState>({
    conversationId,
    query: "",
  });
  const searchQuery = getActiveConversationSearchQuery(
    searchState,
    conversationId,
  );
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const internalMessageScrollHandleRef = useRef<MessageScrollHandle | null>(
    null,
  );
  const activeMessageScrollHandleRef =
    messageScrollHandleRef ?? internalMessageScrollHandleRef;

  const { unpinMessage } = useActivityMessageActions();

  const conversationData = useConversationData(
    getConversationDataProps(props, isTyping, typingUsers),
  );

  const { headerProps, activeTypingUsers, typingText, isCompleted } =
    conversationData;
  const {
    activeMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    isSearching,
    matchCount,
    normalizedQuery,
  } = useConversationMessageSearch({
    chatId,
    hasOlderMessages,
    isLoadingOlderMessages,
    messages,
    messageScrollHandleRef: activeMessageScrollHandleRef,
    onLoadOlderMessages,
    query: searchQuery,
  });

  const {
    clearMessageSelection,
    isMessageSelectionMode,
    selectedMessageIds,
    selectedMessages,
    startMessageSelection,
    toggleMessageSelection,
  } = useConversationMessageSelection({ conversationId, messages });

  const searchResultLabel = getSearchResultLabel({
    activeMatchIndex,
    isSearching,
    matchCount,
    normalizedQuery,
  });
  const composerGroup = getConversationComposerGroup(props);
  const capabilities = getConversationCapabilities(composerGroup);
  const handleCreateProposal =
    canOpenPlanProposalDialog(kind, activePlan, isCompleted) &&
    capabilities.canSuggestPlanChange &&
    !capabilities.isSystemManaged
      ? createOpenProposalDialogHandler(setIsProposalDialogOpen)
      : undefined;
  const handleUnpinPinnedMessage = createPinnedMessageUnpinHandler({
    allPinnedMessages,
    unpinMessage,
  });
  const handleActivatePinnedMessage = (messageId: string) => {
    activeMessageScrollHandleRef.current?.scrollToMessage(messageId, {
      highlight: true,
    });
  };
  const handleSearchQueryChange = (query: string) =>
    setSearchState(getNextConversationSearchState(conversationId, query));
  const onViewStatusDetails = getStatusBarDetailsHandler({
    isNotesChat,
    onToggleAction,
    onViewPlan,
  });

  const dialogProps = {
    activePlan,
    isCompleted,
    isOpen: isProposalDialogOpen,
    onOpenChange: setIsProposalDialogOpen,
  };
  const workspaceHeaderProps = {
    activeTypingUsers,
    headerProps,
    kind,
    isNotesChat,
    isActionOpen,
    matchCount,
    openHeaderDetailsInPanel,
    searchQuery,
    searchResultLabel,
    typingText,
    onBack,
    onSearchQueryChange: handleSearchQueryChange,
    onSearchNext: goToNextMatch,
    onSearchPrevious: goToPreviousMatch,
    onToggleAction,
  };
  const statusBarProps = {
    plan: getConversationStatusBarPlan(props),
    pinnedMessages: allPinnedMessages,
    onViewDetails: onViewStatusDetails,
    onUnpinPinnedMessage: handleUnpinPinnedMessage,
    onActivatePinnedMessage: handleActivatePinnedMessage,
  };
  const alertProps = {
    isMessageError,
    isOnline,
    messageCount: messages.length,
    onRetryMessages,
  };
  const messageAreaProps = {
    activeTypingUsers,
    activeMessageScrollHandleRef,
    conversationId,
    firstUnreadMessageId,
    focusedMessageId,
    kind,
    messageListStatus: {
      hasOlderMessages,
      isLoadingMessages,
      isLoadingOlderMessages,
      isMessageError,
      isNotesChat,
      isOnline,
    },
    messages,
    messagesContainerRef,
    messagesEndRef,
    normalizedQuery,
    selectionState: {
      isSelectionMode: isMessageSelectionMode,
      selectedMessageIds,
    },
    onLoadOlderMessages,
    onRetryMessages,
    onShowParticipantProfile,
    onStartSelection: startMessageSelection,
    onToggleSelected: toggleMessageSelection,
  };
  const composerProps = {
    chatId,
    group: composerGroup,
    inputPlaceholder,
    isBlockedDirectChat,
    isCompleted,
    isMessageSelectionMode,
    selectedMessages,
    sendError,
    onClearSelection: clearMessageSelection,
    onClearSendError,
    onCreateProposal: handleCreateProposal,
    onSendMessage,
  };

  return {
    alertProps,
    capabilities,
    composerProps,
    dialogProps,
    headerProps: workspaceHeaderProps,
    messageAreaProps,
    statusBarProps,
  };
}
