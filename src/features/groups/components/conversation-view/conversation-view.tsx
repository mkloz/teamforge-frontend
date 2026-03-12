import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { Group, Message } from "../../types/groups.types";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { PinnedBanner } from "./pinned-banner";
import { TypingIndicator } from "./typing-indicator";
import { CompletedBanner } from "./completed-banner";

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

  const isPlanDraft = group.plan.status === "DRAFT";
  const isCompleted = group.status === "COMPLETED";

  // Mock typing users for design (would come from real-time in production)
  const typingUsers = isPlanDraft ? [
    { name: "Jordan", avatar: group.members[0]?.avatar }
  ] : [];

  // Mock confirmation progress for design
  const confirmationProgress = isPlanDraft ? {
    confirmed: 2,
    total: group.members.length,
    memberAvatars: group.members.map(m => m.avatar),
    confirmedIds: group.members.slice(0, 2).map(m => m.id),
  } : undefined;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <ConversationHeader
        group={group}
        onBack={onBack}
        onToggleDetail={onToggleDetail}
      />

      {/* Pinned banner for draft plans */}
      {isPlanDraft && (
        <PinnedBanner
          title="Plan awaiting confirmation"
          description="You haven't confirmed yet. Review the details and confirm to lock in."
          onViewPlan={onToggleDetail}
          confirmationProgress={confirmationProgress}
        />
      )}

      {/* Messages area with relative positioning for FAB */}
      <div className="flex-1 relative overflow-hidden">
        <MessageList 
          messages={messages} 
          messagesEndRef={messagesEndRef} 
          containerRef={messagesContainerRef}
          groupMembers={group.members}
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

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
