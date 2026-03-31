import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import {
  shouldShowAvatar,
  shouldShowSenderAnchor,
} from "@/features/activity/lib/chat-utils";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { cn } from "@/shared/lib/utils";
import React, { memo } from "react";
import { ChatBackground } from "../chat-background";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { TypingPresence } from "./typing-presence";
import { UnreadIndicator } from "./unread-indicator";

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  kind: "dm" | "group";
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  typingUsers?: { name: string; avatar: string }[];
}

/**
 * UnifiedMessageList - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export const UnifiedMessageList = memo(function UnifiedMessageList({
  messages,
  kind,
  messagesEndRef,
  containerRef,
  typingUsers = [],
}: UnifiedMessageListProps) {
  const { showScrollToBottom, handleScroll, scrollToBottom } = useChatScroll(
    messagesEndRef,
    containerRef,
    messages.length,
    kind,
  );
  const groupedMessages = useMessageGrouping(messages);

  const scrollToUnvoted = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // We keep track of the global index across date groups for unread indicators and context
  let globalMsgIdx = 0;

  return (
    <div className="relative h-full flex flex-col min-h-0 bg-canvas">
      <ChatBackground />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-0 scroll-smooth scrollbar-none scroll-margin-top-12"
      >
        <div className="flex flex-col pb-2">
          {groupedMessages.map((group) => (
            <div
              key={`group-${group.date}`}
              className="flex flex-col gap-0.5 relative"
            >
              <DateSeparator date={group.date} />

              {group.items.map((message) => {
                const currentIdx = globalMsgIdx++;
                const prevMessage = messages[currentIdx - 1];
                const nextMessage = messages[currentIdx + 1];

                const showSenderName = shouldShowSenderAnchor(
                  message,
                  prevMessage,
                );
                const showAvatar = shouldShowAvatar(message, nextMessage);
                const isSameAsPrev = prevMessage?.senderId === message.senderId;

                return (
                  <div
                    key={message.id}
                    id={`msg-${message.id}`}
                    className={cn(
                      "flex flex-col",
                      isSameAsPrev ? "gap-0.5" : "gap-1.5",
                    )}
                  >
                    {/* Unread Indicator Anchor - roughly 3 messages from bottom if fresh */}
                    {currentIdx === messages.length - 3 && <UnreadIndicator />}

                    <MessageRenderer
                      message={message}
                      showAvatar={showAvatar}
                      showSender={showSenderName}
                      kind={kind}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          <TypingPresence typingUsers={typingUsers} />
          <div ref={messagesEndRef} className="h-0 w-full shrink-0" />
        </div>
      </div>

      <ScrollActionButtons
        showScrollToBottom={showScrollToBottom}
        onScrollToBottom={scrollToBottom}
        hasUnvoted={messages.some(
          (m) => m.type === "PLAN_UPDATE" && !m.hasVoted,
        )}
        onScrollToUnvoted={() => {
          const firstUnvoted = messages.find(
            (m) => m.type === "PLAN_UPDATE" && !m.hasVoted,
          );
          if (firstUnvoted) scrollToUnvoted(firstUnvoted.id);
        }}
      />
    </div>
  );
});
