import type { RefObject } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { PlanChangeDialog } from "@/features/activity/components/groups/group-detail-panel/plan-section/plan-change-dialog";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useConversationData } from "@/features/activity/hooks/use-conversation-data";
import type {
  ActivityParticipant,
  ActivitySendMessageInput,
  DirectChat,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { ChatStatusBar } from "./chat-status-bar";
import {
  ConversationAlertBanners,
  ConversationComposer,
  ConversationMessageArea,
} from "./conversation-view-sections";
import {
  getConversationViewState,
  getSearchResultLabel,
} from "./conversation-view-state";
import { UnifiedChatHeader } from "./unified-chat-header";
import { ChatBackground } from "./unified-message-list/chat-background";
import type { MessageScrollHandle } from "./unified-message-list/message-scroll.types";
import { useConversationMessageSearch } from "./use-conversation-message-search";
import { useConversationMessageSelection } from "./use-conversation-message-selection";

type UnifiedConversationViewProps =
  | (BaseConversationProps & { kind: "dm"; data: DirectChat })
  | (BaseConversationProps & { kind: "group"; data: Group });

interface BaseConversationProps {
  messages: UnifiedMessage[];
  hasOlderMessages?: boolean;
  isTyping?: boolean;
  firstUnreadMessageId?: string | null;
  isLoadingOlderMessages?: boolean;
  isMessageError?: boolean;
  isOnline?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
  isActionOpen?: boolean;
  openHeaderDetailsInPanel?: boolean;
  focusedMessageId?: string | null;
  isLoadingMessages?: boolean;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  sendError?: string | null;
  onBack: () => void;
  onClearSendError?: () => void;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onToggleAction: () => void;
  onViewPlan?: () => void;
  onSendMessage: (input: ActivitySendMessageInput) => Promise<void> | void;
}

/**
 * UnifiedConversationView - The flagship container for all conversations.
 * Consolidates Groups and Direct Chats into a single, high-performance UI.
 */
export const UnifiedConversationView = memo(function UnifiedConversationView(
  props: UnifiedConversationViewProps,
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
  const { kind, data } = props;
  const {
    activePlan,
    allPinnedMessages,
    chatId,
    conversationId,
    inputPlaceholder,
    isBlockedDirectChat,
    isNotesChat,
  } = getConversationViewState(props);
  const [searchQuery, setSearchQuery] = useState("");
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
    kind === "group"
      ? { kind, data, isTyping, typingUsers }
      : { kind, data, isTyping, typingUsers },
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

  useEffect(() => {
    if (conversationId) {
      setSearchQuery("");
    }
  }, [conversationId]);

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
  const handleCreateProposal =
    kind === "group" && activePlan && !isCompleted
      ? () => setIsProposalDialogOpen(true)
      : undefined;

  return (
    <div
      data-chat-dropzone-root
      className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas/40"
    >
      <ChatBackground />

      {activePlan && !isCompleted ? (
        <PlanChangeDialog
          open={isProposalDialogOpen}
          onOpenChange={setIsProposalDialogOpen}
          plan={activePlan}
          trigger={null}
        />
      ) : null}

      <UnifiedChatHeader
        kind={kind}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        avatarUrl={headerProps.avatarUrl}
        avatarKind={isNotesChat ? "notes" : "default"}
        detailsNavigation={
          openHeaderDetailsInPanel ? undefined : headerProps.detailsNavigation
        }
        onlineStatus={headerProps.onlineStatus}
        isTyping={activeTypingUsers.length > 0}
        typingText={typingText}
        isActionOpen={isActionOpen}
        searchQuery={searchQuery}
        searchResultLabel={searchResultLabel}
        isSearchNavigationDisabled={matchCount === 0}
        showAction={!isNotesChat}
        onBack={onBack}
        onSearchQueryChange={setSearchQuery}
        onSearchNext={goToNextMatch}
        onSearchPrevious={goToPreviousMatch}
        onToggleAction={isNotesChat ? () => {} : onToggleAction}
      />

      <ChatStatusBar
        plan={kind === "group" ? (data.plan ?? undefined) : undefined}
        pinnedMessages={allPinnedMessages}
        onViewDetails={isNotesChat ? () => {} : (onViewPlan ?? onToggleAction)}
        onUnpinPinnedMessage={(messageId) => {
          const targetMessage = allPinnedMessages.find(
            (message) => message.id === messageId,
          );

          if (!targetMessage) {
            return;
          }

          void unpinMessage(targetMessage);
        }}
        onActivatePinnedMessage={(messageId) =>
          activeMessageScrollHandleRef.current?.scrollToMessage(messageId, {
            highlight: true,
          })
        }
      />

      <ConversationAlertBanners
        isMessageError={isMessageError}
        isOnline={isOnline}
        messageCount={messages.length}
        onRetryMessages={onRetryMessages}
      />

      {/* Message area */}
      <ConversationMessageArea
        activeTypingUsers={activeTypingUsers}
        activeMessageScrollHandleRef={activeMessageScrollHandleRef}
        conversationId={conversationId}
        firstUnreadMessageId={firstUnreadMessageId}
        focusedMessageId={focusedMessageId}
        hasOlderMessages={hasOlderMessages}
        isLoadingMessages={isLoadingMessages}
        isLoadingOlderMessages={isLoadingOlderMessages}
        isMessageError={isMessageError}
        isMessageSelectionMode={isMessageSelectionMode}
        isNotesChat={isNotesChat}
        isOnline={isOnline}
        kind={kind}
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        normalizedQuery={normalizedQuery}
        selectedMessageIds={selectedMessageIds}
        onLoadOlderMessages={onLoadOlderMessages}
        onRetryMessages={onRetryMessages}
        onShowParticipantProfile={onShowParticipantProfile}
        onStartSelection={startMessageSelection}
        onToggleSelected={toggleMessageSelection}
      />

      {/* Input area */}
      <ConversationComposer
        chatId={chatId}
        group={kind === "group" ? data : null}
        inputPlaceholder={inputPlaceholder}
        isBlockedDirectChat={isBlockedDirectChat}
        isCompleted={isCompleted}
        isMessageSelectionMode={isMessageSelectionMode}
        selectedMessages={selectedMessages}
        sendError={sendError}
        onClearSelection={clearMessageSelection}
        onClearSendError={onClearSendError}
        onCreateProposal={handleCreateProposal}
        onSendMessage={onSendMessage}
      />
    </div>
  );
});
