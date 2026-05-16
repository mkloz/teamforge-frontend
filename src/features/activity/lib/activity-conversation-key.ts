import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";

export type ActivityConversationKey =
  `${UnifiedConversation["kind"]}:${string}`;

export function getActivityConversationKey(
  kind: UnifiedConversation["kind"],
  id: string,
): ActivityConversationKey {
  return `${kind}:${id}`;
}
