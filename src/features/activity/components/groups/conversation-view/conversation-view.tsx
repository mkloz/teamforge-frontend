import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Group, Message } from "@/features/activity/types/groups.types";
import { ChatStatusBar } from "./chat-status-bar";
import { CompletedBanner } from "./completed-banner";
import { ConversationHeader } from "./conversation-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { TypingIndicator } from "./typing-indicator";

interface ConversationViewProps {
  group: Group;
  messages: Message[];
  onBack: () => void;
  onToggleDetail: () => void;
  onSendMessage: (content: string) => void;
}

export function ConversationView({
  group,
  messages,
  onBack,
  onToggleDetail,
  onSendMessage,
}: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom instantly on initial render (before paint)
  useLayoutEffect(() => {
    if (isInitialRender.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialRender.current = false;
    }
  }, [group.id]);

  // Scroll smoothly when new messages arrive
  useEffect(() => {
    if (!isInitialRender.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Reset initial render flag when group changes
  useEffect(() => {
    isInitialRender.current = true;
  }, [group.id]);

  // Track scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isCompleted = group.status === "COMPLETED";

  // Mock typing users for design (would come from real-time in production)
  const typingUsers =
    group.plan.status === "DRAFT"
      ? [{ name: "Jordan", avatar: group.members[0]?.avatar }]
      : [];

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Header */}
      <ConversationHeader
        group={group}
        onBack={onBack}
        onToggleDetail={onToggleDetail}
      />

      {/* Compact status bar - always visible */}
      <ChatStatusBar
        plan={group.plan}
        groupStatus={group.status}
        onViewDetails={onToggleDetail}
      />

      {/* Messages area with relative positioning for FAB */}
      <div className="flex-1 relative overflow-hidden">
        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          containerRef={messagesContainerRef}
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        {/* Scroll to bottom FAB */}
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToBottom}
          className={cn(
            "absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg",
            "transition-all duration-200",
            showScrollButton
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none",
          )}
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </Button>
      </div>

      {/* Completed banner or message input */}
      {isCompleted ? (
        <CompletedBanner groupName={group.plan.title} />
      ) : (
        <MessageInput onSend={onSendMessage} />
      )}
    </div>
  );
}
