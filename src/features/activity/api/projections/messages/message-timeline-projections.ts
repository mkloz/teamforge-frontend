import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export function mergeConversationTimeline(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  return [...messages, ...proposalMessages].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
