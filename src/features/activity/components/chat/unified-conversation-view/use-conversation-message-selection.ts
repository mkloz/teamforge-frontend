import { useCallback, useEffect, useMemo, useState } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface UseConversationMessageSelectionInput {
  conversationId: string;
  messages: UnifiedMessage[];
}

export function useConversationMessageSelection({
  conversationId,
  messages,
}: UseConversationMessageSelectionInput) {
  const [selectedMessageIds, setSelectedMessageIds] = useState<
    ReadonlySet<string>
  >(() => new Set());

  useEffect(() => {
    if (conversationId) {
      setSelectedMessageIds(new Set());
    }
  }, [conversationId]);

  const clearMessageSelection = useCallback(() => {
    setSelectedMessageIds(new Set());
  }, []);

  const startMessageSelection = useCallback((message: UnifiedMessage) => {
    if (!canSelectChatMessage(message)) {
      return;
    }

    setSelectedMessageIds(new Set([message.id]));
  }, []);

  const toggleMessageSelection = useCallback((message: UnifiedMessage) => {
    if (!canSelectChatMessage(message)) {
      return;
    }

    setSelectedMessageIds((current) => {
      const next = new Set(current);

      if (next.has(message.id)) {
        next.delete(message.id);
      } else {
        next.add(message.id);
      }

      return next;
    });
  }, []);

  const selectedMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          selectedMessageIds.has(message.id) && canSelectChatMessage(message),
      ),
    [messages, selectedMessageIds],
  );
  const isMessageSelectionMode = selectedMessages.length > 0;

  useEffect(() => {
    if (selectedMessageIds.size === 0) {
      return;
    }

    const availableMessageIds = new Set(messages.map((message) => message.id));

    setSelectedMessageIds((current) => {
      const next = new Set(
        [...current].filter((messageId) => availableMessageIds.has(messageId)),
      );

      return next.size === current.size ? current : next;
    });
  }, [messages, selectedMessageIds.size]);

  useEffect(() => {
    if (!isMessageSelectionMode) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearMessageSelection();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearMessageSelection, isMessageSelectionMode]);

  return {
    clearMessageSelection,
    isMessageSelectionMode,
    selectedMessageIds,
    selectedMessages,
    startMessageSelection,
    toggleMessageSelection,
  };
}

function canSelectChatMessage(message: UnifiedMessage) {
  return message.type !== "SYSTEM";
}
