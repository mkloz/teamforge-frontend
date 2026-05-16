import type { RefObject } from "react";
import { memo, useEffect, useRef, useState } from "react";
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
import { CompletedReviewGate } from "./completed-banner";
import { UnifiedChatHeader } from "./unified-chat-header";
import { UnifiedMessageInput } from "./unified-message-input";
import { UnifiedMessageList } from "./unified-message-list";
import type { MessageScrollHandle } from "./unified-message-list/message-scroll.types";
import { useConversationMessageSearch } from "./use-conversation-message-search";

type UnifiedConversationViewProps =
  | (BaseConversationProps & { kind: "dm"; data: DirectChat })
  | (BaseConversationProps & { kind: "group"; data: Group });

interface BaseConversationProps {
  messages: UnifiedMessage[];
  hasOlderMessages?: boolean;
  isTyping?: boolean;
  isLoadingOlderMessages?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
  isActionOpen?: boolean;
  focusedMessageId?: string | null;
  isLoadingMessages?: boolean;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  sendError?: string | null;
  onBack: () => void;
  onClearSendError?: () => void;
  onLoadOlderMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onToggleAction: () => void;
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
    typingUsers = [],
    isActionOpen = false,
    focusedMessageId,
    isLoadingMessages = false,
    messageScrollHandleRef,
    sendError = null,
    hasOlderMessages = false,
    isLoadingOlderMessages = false,
    onBack,
    onClearSendError,
    onLoadOlderMessages,
    onShowParticipantProfile,
    onToggleAction,
    onSendMessage,
  } = props;
  const { kind, data } = props;
  const conversationId = `${kind}:${data.id}`;
  const chatId = kind === "group" ? (data.chat?.id ?? null) : data.id;
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const internalMessageScrollHandleRef = useRef<MessageScrollHandle | null>(
    null,
  );
  const activeMessageScrollHandleRef =
    messageScrollHandleRef ?? internalMessageScrollHandleRef;

  const { unpinMessage } = useActivityMessageActions();
  const isBlockedDirectChat = kind === "dm" && Boolean(data.isBlocked);
  const isNotesChat = kind === "dm" && data.type === "NOTES";

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

  const searchResultLabel = normalizedQuery
    ? isSearching && matchCount === 0
      ? "Searching..."
      : matchCount > 0
        ? `${Math.min(activeMatchIndex + 1, matchCount)}/${matchCount}`
        : "No results"
    : undefined;

  const pinnedMessagesFromData =
    kind === "group" ? data.chat?.pinnedMessages : data.pinnedMessages;

  const allPinnedMessages: UnifiedMessage[] = (
    pinnedMessagesFromData || []
  ).map((msg: UnifiedMessage) => Object.assign({}, msg, { isOwn: false }));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas/40">
      <UnifiedChatHeader
        kind={kind}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        avatarUrl={headerProps.avatarUrl}
        detailsNavigation={headerProps.detailsNavigation}
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
        onViewDetails={isNotesChat ? () => {} : onToggleAction}
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

      {/* Message area */}
      <div className="relative flex-1 overflow-hidden">
        <UnifiedMessageList
          key={conversationId}
          messages={messages}
          searchQuery={normalizedQuery}
          kind={kind}
          conversationId={conversationId}
          focusedMessageId={focusedMessageId}
          hasOlderMessages={hasOlderMessages}
          isInitialLoading={isLoadingMessages}
          isLoadingOlderMessages={isLoadingOlderMessages}
          messagesEndRef={messagesEndRef}
          containerRef={messagesContainerRef}
          messageScrollHandleRef={activeMessageScrollHandleRef}
          onLoadOlderMessages={onLoadOlderMessages}
          onShowParticipantProfile={onShowParticipantProfile}
          typingUsers={activeTypingUsers}
        />
      </div>

      {/* Input area */}
      {isCompleted && kind === "group" && data.plan ? (
        <CompletedReviewGate group={data}>
          <UnifiedMessageInput
            chatId={chatId}
            errorMessage={sendError}
            disabled={isBlockedDirectChat}
            onSend={onSendMessage}
            onClearError={onClearSendError}
            placeholder={
              isBlockedDirectChat
                ? "Unblock this user to send messages"
                : undefined
            }
          />
        </CompletedReviewGate>
      ) : (
        <UnifiedMessageInput
          chatId={chatId}
          errorMessage={sendError}
          disabled={isBlockedDirectChat}
          onSend={onSendMessage}
          onClearError={onClearSendError}
          placeholder={
            isBlockedDirectChat
              ? "Unblock this user to send messages"
              : undefined
          }
        />
      )}
    </div>
  );
});
