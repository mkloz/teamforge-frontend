import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { UserProfilePanel } from "@/features/profile/components/user-profile-panel/user-profile-panel";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import React, { memo, useCallback, useState } from "react";
import { ChatBackground } from "../chat-background";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { TypingPresence } from "./typing-presence";
import type { User } from "@/shared/schemas";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  kind: "dm" | "group";
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  typingUsers?: { fullName: string; avatar: string }[];
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
  const [selectedSender, setSelectedSender] = useState<User | null>(null);

  const handleAvatarClick = useCallback(
    (sender: User) => {
      if (kind === "dm") {
        onToggleAction?.();
      } else {
        setSelectedSender(sender);
      }
    },
    [kind, onToggleAction],
  );

  const handleCloseProfile = useCallback(() => setSelectedSender(null), []);

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

  return (
    <div className="relative h-full flex flex-col min-h-0 bg-canvas">
      <ChatBackground />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto px-1 pt-4 pb-0 scroll-smooth scrollbar-none scroll-margin-top-12"
      >
        <div className="flex flex-col pb-2">
          {groupedMessages.map((dateGroup) => (
            <div
              key={`date-${dateGroup.date}`}
              className="flex flex-col gap-0.5 relative"
            >
              <DateSeparator date={dateGroup.date} />

              {dateGroup.senderGroups.map((senderGroup, groupIdx) => {
                // Handle both mock variants until auth store is integrated
                const isOwn =
                  senderGroup.senderId === "current-user" ||
                  senderGroup.senderId === "user-current";

                return (
                  <div
                    key={`sender-group-${dateGroup.date}-${senderGroup.senderId}-${groupIdx}`}
                    className={cn(
                      "flex items-stretch gap-3 group/sender mb-3 relative",
                      isOwn ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    {/* Avatar Column (Sticky) */}
                    {!isOwn && senderGroup.senderId !== "system" && (
                      <div className="w-8 shrink-0 flex flex-col justify-end">
                        <div className="sticky bottom-2 flex flex-col items-center">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              senderGroup.sender &&
                              handleAvatarClick(senderGroup.sender)
                            }
                            className="rounded-full h-8 w-8 p-0"
                            aria-label={`View ${senderGroup.sender?.fullName}'s profile`}
                          >
                            <img
                              src={senderGroup.sender?.avatar || ""}
                              alt={senderGroup.sender?.fullName || "User"}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-border shadow-sm"
                            />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Messages Column */}
                    <div
                      className={cn(
                        "flex-1 flex flex-col min-w-0",
                        isOwn ? "items-end" : "items-start",
                      )}
                    >
                      {senderGroup.items.map((message, msgIdx) => {
                        const isFirstInGroup = msgIdx === 0;

                        return (
                          <div
                            key={message.id}
                            id={`msg-${message.id}`}
                            className="w-full"
                          >
                            <MessageRenderer
                              message={message}
                              showSender={isFirstInGroup}
                              kind={kind}
                            />
                          </div>
                        );
                      })}
                    </div>
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

      {/* User Profile Panel - Using shadcn Drawer for better accessibility and unified physics */}
      <Drawer
        open={!!selectedSender}
        onOpenChange={(open) => !open && handleCloseProfile()}
      >
        <DrawerContent className="bg-canvas border-t rounded-t-3xl max-h-[75svh] sm:max-w-md mx-auto">
          <DrawerHeader className="sr-only">
            <DrawerTitle>User Profile</DrawerTitle>
          </DrawerHeader>

          {selectedSender && (
            <UserProfilePanel
              participant={selectedSender}
              isMobile={true}
              isDirectChat={false}
              onBack={handleCloseProfile}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
});
