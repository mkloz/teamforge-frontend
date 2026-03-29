import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
} from "react";
import type {
  DirectChat,
  DirectMessage,
} from "@/features/activity/types/direct-chats.types";
import { DirectChatHeader } from "./direct-chat-header";
import { DirectMessageInput } from "./direct-message-input";
import { DirectMessageItem } from "./direct-message-item";
import { TypingIndicator } from "./typing-indicator";
import {
  formatDateSeparator,
  shouldShowAvatar,
  shouldShowDateSeparator,
} from "@/features/activity/lib/chat-utils";

interface DirectChatViewProps {
  chat: DirectChat;
  messages: DirectMessage[];
  isTyping?: boolean;
  onBack?: () => void;
  onToggleProfile: () => void;
  onSendMessage: (content: string) => void;
}

/**
 * DirectChatView - Main container for a direct messaging conversation.
 * Orchestrates the header, message list, typing indicators, and input.
 * Optimized with layout effects for scroll anchoring and memoized list items.
 */
export const DirectChatView = memo(function DirectChatView({
  chat,
  messages,
  isTyping = false,
  onBack,
  onToggleProfile,
  onSendMessage,
}: DirectChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Scroll to bottom on new messages (only if already near bottom)
  useLayoutEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  // Track scroll position to manage scroll buttons and anchoring
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
      setShowScrollButton(distanceFromBottom > 300);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col h-full bg-canvas/40">
      {/* Header */}
      <DirectChatHeader
        chat={chat}
        onBack={onBack}
        onToggleProfile={onToggleProfile}
      />

      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto px-4 py-4 scroll-smooth scrollbar-thin hover:scrollbar-thumb-muted-foreground/20"
        >
          <div className="flex flex-col gap-1.5 pb-2">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showDate = shouldShowDateSeparator(message, prevMessage);
              const showAvatar = shouldShowAvatar(message, prevMessage);

              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-6">
                      <div className="absolute h-px w-full bg-border/40 -z-10" />
                      <span className="px-4 py-1.5 rounded-full bg-canvas border border-border text-[11px] text-slate-muted font-bold tracking-wide shadow-sm">
                        {formatDateSeparator(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message item */}
                  <DirectMessageItem
                    message={message}
                    showAvatar={showAvatar}
                    participantAvatar={chat.participant.avatar}
                    participantName={chat.participant.name}
                  />
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <TypingIndicator
                name={chat.participant.name}
                avatar={chat.participant.avatar}
              />
            )}

            {/* Anchor for scrolling */}
            <div ref={messagesEndRef} className="h-2 w-full" />
          </div>
        </div>

        {/* Scroll to bottom FAB */}
        <div
          className={cn(
            "absolute bottom-6 right-6 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            showScrollButton
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-50 opacity-0 translate-y-10 pointer-events-none",
          )}
        >
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className="h-11 w-11 rounded-full shadow-xl bg-canvas border border-border hover:bg-muted transition-colors active:scale-95"
            aria-label="Scroll to bottom"
          >
            <ChevronDown
              size={22}
              className="text-forge-teal"
              strokeWidth={3}
            />
          </Button>
        </div>
      </div>

      {/* Message input */}
      <DirectMessageInput onSend={onSendMessage} />
    </div>
  );
});
