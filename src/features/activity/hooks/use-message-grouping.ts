import { useMemo } from "react";
import type { UnifiedMessage } from "../types/chat.types";
import { shouldShowDateSeparator } from "../lib/chat-utils";

/**
 * useMessageGrouping - Logic for grouping messages by date.
 */
export function useMessageGrouping(messages: UnifiedMessage[]) {
  return useMemo(() => {
    const groups: { date: string; items: UnifiedMessage[] }[] = [];

    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];
      if (!prevMsg || shouldShowDateSeparator(msg, prevMsg)) {
        groups.push({ date: msg.createdAt, items: [msg] });
      } else {
        groups[groups.length - 1].items.push(msg);
      }
    });

    return groups;
  }, [messages]);
}
