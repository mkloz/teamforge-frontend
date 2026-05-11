import { useNavigate } from "@tanstack/react-router";
import type { RefObject } from "react";
import { memo, useRef } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useConversationData } from "@/features/activity/hooks/use-conversation-data";
import type {
  ActivitySendMessageInput,
  DirectChat,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { useIsMobile } from "@/shared/hooks/use-breakpoint";
import { ChatStatusBar } from "./chat-status-bar";
import { CompletedBanner } from "./completed-banner";
import { UnifiedChatHeader } from "./unified-chat-header";
import { UnifiedMessageInput } from "./unified-message-input";
import { UnifiedMessageList } from "./unified-message-list";
import type { MessageScrollHandle } from "./unified-message-list/message-scroll.types";

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
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  sendError?: string | null;
  onBack: () => void;
  onClearSendError?: () => void;
  onLoadOlderMessages?: () => Promise<void> | void;
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
    messageScrollHandleRef,
    sendError = null,
    hasOlderMessages = false,
    isLoadingOlderMessages = false,
    onBack,
    onClearSendError,
    onLoadOlderMessages,
    onToggleAction,
    onSendMessage,
  } = props;
  const { kind, data } = props;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const internalMessageScrollHandleRef = useRef<MessageScrollHandle | null>(
    null,
  );
  const activeMessageScrollHandleRef =
    messageScrollHandleRef ?? internalMessageScrollHandleRef;

  const { unpinMessage } = useActivityMessageActions();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isBlockedDirectChat = kind === "dm" && Boolean(data.isBlocked);

  const conversationData = useConversationData(
    kind === "group"
      ? { kind, data, isTyping, typingUsers }
      : { kind, data, isTyping, typingUsers },
  );

  const { headerProps, activeTypingUsers, typingText, isCompleted } =
    conversationData;

  const pinnedMessagesFromData =
    kind === "group" ? data.chat?.pinnedMessages : data.pinnedMessages;

  const allPinnedMessages: UnifiedMessage[] = (
    pinnedMessagesFromData || []
  ).map((msg: UnifiedMessage) => Object.assign({}, msg, { isOwn: false }));

  function handleViewGroupPlanDetails() {
    if (kind !== "group") {
      onToggleAction();
      return;
    }

    void navigate(
      buildGroupPlanDetailNavigation(data.id, { source: "activity" }),
    );
  }

  return (
    <div className="fade-in flex h-full animate-in flex-col bg-canvas/40 duration-300">
      <UnifiedChatHeader
        kind={kind}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        avatarUrl={headerProps.avatarUrl}
        secondaryAvatar={headerProps.secondaryAvatar}
        onlineStatus={headerProps.onlineStatus}
        isTyping={isMobile && activeTypingUsers.length > 0}
        typingText={typingText}
        isActionOpen={isActionOpen}
        onBack={onBack}
        onToggleAction={onToggleAction}
      />

      <ChatStatusBar
        plan={kind === "group" ? (data.plan ?? undefined) : undefined}
        pinnedMessages={allPinnedMessages}
        onViewDetails={handleViewGroupPlanDetails}
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
          messages={messages}
          kind={kind}
          focusedMessageId={focusedMessageId}
          hasOlderMessages={hasOlderMessages}
          isLoadingOlderMessages={isLoadingOlderMessages}
          messagesEndRef={messagesEndRef}
          containerRef={messagesContainerRef}
          messageScrollHandleRef={activeMessageScrollHandleRef}
          onLoadOlderMessages={onLoadOlderMessages}
          typingUsers={activeTypingUsers}
          onToggleAction={onToggleAction}
        />
      </div>

      {/* Input area */}
      {isCompleted && kind === "group" && data.plan ? (
        <CompletedBanner group={data} />
      ) : (
        <UnifiedMessageInput
          chatId={kind === "group" ? (data.chat?.id ?? null) : data.id}
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
