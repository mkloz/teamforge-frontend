import { useConversationData } from "@/features/activity/hooks/use-conversation-data";
import { useActivityStore } from "@/features/activity/store/activity.store";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import type { Group } from "@/features/activity/types/groups.types";
import { useIsMobile } from "@/shared/hooks/use-breakpoint";
import { memo, useRef } from "react";
import { ChatStatusBar } from "../chat-status-bar";
import { CompletedBanner } from "../completed-banner";
import { UnifiedChatHeader } from "../unified-chat-header";
import { UnifiedMessageInput } from "../unified-message-input";
import { UnifiedMessageList } from "../unified-message-list/index";

type UnifiedConversationViewProps =
  | (BaseConversationProps & { kind: "dm"; data: DirectChat })
  | (BaseConversationProps & { kind: "group"; data: Group });

interface BaseConversationProps {
  messages: UnifiedMessage[];
  isTyping?: boolean;
  typingUsers?: { fullName: string; avatar: string }[];
  isActionOpen?: boolean;
  onBack: () => void;
  onToggleAction: () => void;
  onSendMessage: (content: string) => void;
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
    onBack,
    onToggleAction,
    onSendMessage,
  } = props;
  const { kind, data } = props;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const storePinnedMessages = useActivityStore((state) => state.pinnedMessages);
  const unpinMessage = useActivityStore((state) => state.unpinMessage);
  const isMobile = useIsMobile();

  const conversationData = useConversationData(
    kind === "group"
      ? { kind, data, isTyping, typingUsers }
      : { kind, data, isTyping, typingUsers },
  );

  const { headerProps, activeTypingUsers, typingText, isCompleted } =
    conversationData;

  const pinnedMessagesFromData =
    kind === "group" ? data.chat?.pinnedMessages : data.pinnedMessages;

  const dataPinnedMessages: UnifiedMessage[] = (
    pinnedMessagesFromData || []
  ).map((msg) => ({
    ...msg,
    isOwn: false, // Default for pinned messages from others or system
  }));

  const allPinnedMessages = [
    ...dataPinnedMessages,
    ...storePinnedMessages.filter(
      (storeMsg) =>
        !dataPinnedMessages.some((dataMsg) => dataMsg.id === storeMsg.id),
    ),
  ];

  return (
    <div className="flex flex-col h-full bg-canvas/40 animate-in fade-in duration-300">
      <UnifiedChatHeader
        kind={kind}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        avatarUrl={headerProps.avatarUrl || ""}
        secondaryAvatar={headerProps.secondaryAvatar || undefined}
        onlineStatus={headerProps.onlineStatus}
        isTyping={isMobile && activeTypingUsers.length > 0}
        typingText={typingText}
        isActionOpen={isActionOpen}
        onBack={onBack}
        onToggleAction={onToggleAction}
      />

      <ChatStatusBar
        plan={kind === "group" ? data.plan : undefined}
        pinnedMessages={allPinnedMessages}
        onViewDetails={onToggleAction}
        onUnpinPinnedMessage={unpinMessage}
        scrollContainerRef={messagesContainerRef}
      />

      {/* Message area */}
      <div className="flex-1 relative overflow-hidden">
        <UnifiedMessageList
          messages={messages}
          kind={kind}
          messagesEndRef={messagesEndRef}
          containerRef={messagesContainerRef}
          typingUsers={activeTypingUsers}
          onToggleAction={onToggleAction}
        />
      </div>

      {/* Input area */}
      {isCompleted && kind === "group" && data.plan ? (
        <CompletedBanner groupName={data.plan.title} />
      ) : (
        <UnifiedMessageInput onSend={onSendMessage} />
      )}
    </div>
  );
});
