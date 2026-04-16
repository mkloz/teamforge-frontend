import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import {
  shouldShowAvatar,
  shouldShowSenderAnchor,
} from "@/features/activity/lib/chat-utils";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import { UserProfilePanel } from "@/features/profile/components/user-profile-panel/user-profile-panel";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { memo, useCallback, useEffect, useState } from "react";
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
  onToggleAction?: () => void;
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
  onToggleAction,
}: UnifiedMessageListProps) {
  const [selectedSender, setSelectedSender] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);

  const handleAvatarClick = useCallback(
    (senderId: string, senderName: string, senderAvatar: string) => {
      if (kind === "dm") {
        onToggleAction?.();
      } else {
        setSelectedSender({
          id: senderId,
          name: senderName,
          avatar: senderAvatar,
        });
      }
    },
    [kind, onToggleAction],
  );

  const handleCloseProfile = useCallback(() => setSelectedSender(null), []);

  // Build a minimal DirectChat from the sender info to reuse UserProfilePanel
  const senderChat: DirectChat | null = selectedSender
    ? {
        id: `temp-${selectedSender.id}`,
        participant: {
          id: selectedSender.id,
          name: selectedSender.name,
          avatar: selectedSender.avatar,
          onlineStatus: "ONLINE",
          age: 25,
          location: "London, UK",
          bio: "TeamForge member.",
        },
        createdAt: new Date().toISOString(),
        isMuted: false,
        isBlocked: false,
      }
    : null;
  useEffect(() => {
    if (selectedSender) {
      // Body scroll lock on mobile only
      if (window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }
  }, [selectedSender]);

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
        className="relative z-10 flex-1 overflow-y-auto px-1 pt-4 pb-0 scroll-smooth scrollbar-none scroll-margin-top-12"
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
                      onAvatarClick={handleAvatarClick}
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

      {/* User Profile Panel - Custom Conditional Rendering with Framer Motion */}
      <AnimatePresence>
        {senderChat && (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center sm:justify-center sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseProfile}
              aria-hidden="true"
            />

            {/* Profile Panel (Mobile: Bottom Sheet, Desktop: Modal) */}
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative z-10 w-full overflow-hidden border border-border bg-canvas shadow-2xl flex flex-col",
                "rounded-t-3xl sm:rounded-2xl max-h-[75svh] sm:max-w-sm",
              )}
            >
              {/* Mobile Drag Handle Visual - matches Group Detail Panel */}
              <div className="flex justify-center p-3 shrink-0 sm:hidden">
                <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>

              <UserProfilePanel
                chat={senderChat}
                isMobile={true}
                isDirectChat={false}
                onBack={handleCloseProfile}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
