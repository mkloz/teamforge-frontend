import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { DirectChat, DirectMessage } from "../../types/direct-chats.types";
import { DirectChatHeader } from "./direct-chat-header";
import { DirectMessageItem } from "./direct-message-item";
import { DirectMessageInput } from "./direct-message-input";
import { TypingIndicator } from "./typing-indicator";

interface DirectChatViewProps {
  chat: DirectChat;
  messages: DirectMessage[];
  isTyping?: boolean;
  onBack?: () => void;
  onToggleProfile: () => void;
  onSendMessage: (content: string) => void;
}

function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function shouldShowDateSeparator(
  current: DirectMessage,
  previous?: DirectMessage,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.timestamp).toDateString();
  const previousDate = new Date(previous.timestamp).toDateString();
  return currentDate !== previousDate;
}

function shouldShowAvatar(
  current: DirectMessage,
  previous?: DirectMessage,
): boolean {
  if (!previous) return true;
  if (current.isOwn !== previous.isOwn) return true;
  // Show avatar if more than 5 minutes between messages
  const timeDiff =
    new Date(current.timestamp).getTime() -
    new Date(previous.timestamp).getTime();
  return timeDiff > 5 * 60 * 1000;
}

export function DirectChatView({
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

  // Track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
      setShowScrollButton(distanceFromBottom > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <DirectChatHeader
        chat={chat}
        onBack={onBack}
        onToggleProfile={onToggleProfile}
      />

      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={messagesContainerRef} className="h-full overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-1">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
              const showAvatar = shouldShowAvatar(message, prevMessage);

              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                        {formatDateSeparator(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message */}
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
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom FAB */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className={cn(
              "absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg",
              "transition-all duration-200",
              showScrollButton ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none",
            )}
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={20} />
          </Button>
        )}
      </div>

      {/* Message input */}
      <DirectMessageInput onSend={onSendMessage} />
    </div>
  );
}
