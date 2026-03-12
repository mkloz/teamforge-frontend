import { useRef, useEffect, useLayoutEffect } from "react";
import type { Group, Message } from "../../types/groups.types";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { PinnedBanner } from "./pinned-banner";

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
  const isInitialRender = useRef(true);

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

  const isPlanDraft = group.plan.status === "DRAFT";

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
          description="Review the plan details and confirm to lock in."
          onViewPlan={onToggleDetail}
        />
      )}

      {/* Messages area */}
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      {/* Message input */}
      <MessageInput onSend={onSendMessage} disabled={group.status === "COMPLETED"} />
    </div>
  );
}
