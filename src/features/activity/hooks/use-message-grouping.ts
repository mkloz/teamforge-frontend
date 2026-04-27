import { useMemo } from "react";
import type { UnifiedMessage } from "../types/chat.types";
import {
  shouldShowDateSeparator,
  shouldShowSenderAnchor,
} from "../lib/chat-utils";

export interface SenderGroup {
  senderId: string;
  sender: UnifiedMessage["sender"];
  items: UnifiedMessage[];
}

export interface DateGroup {
  date: string;
  senderGroups: SenderGroup[];
}

/**
 * useMessageGrouping - Logic for grouping messages by date and then by sender.
 * This structure supports sticky avatars and cohesive message blocks.
 */
export function useMessageGrouping(messages: UnifiedMessage[]) {
  return useMemo(() => {
    const groups: DateGroup[] = [];

    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];

      // 1. Check for new Date Group
      if (!prevMsg || shouldShowDateSeparator(msg, prevMsg)) {
        groups.push({
          date: msg.createdAt,
          senderGroups: [
            {
              senderId: msg.senderId,
              sender: msg.sender,
              items: [msg],
            },
          ],
        });
        return;
      }

      const currentDateGroup = groups[groups.length - 1];
      const prevSenderGroup =
        currentDateGroup.senderGroups[currentDateGroup.senderGroups.length - 1];

      // 2. Check for new Sender Group within the same date
      // A new sender group starts if the sender changes OR if there's a significant time gap (sender anchor)
      if (shouldShowSenderAnchor(msg, prevMsg)) {
        currentDateGroup.senderGroups.push({
          senderId: msg.senderId,
          sender: msg.sender,
          items: [msg],
        });
      } else {
        // Continue the current sender group
        prevSenderGroup.items.push(msg);
      }
    });

    return groups;
  }, [messages]);
}
