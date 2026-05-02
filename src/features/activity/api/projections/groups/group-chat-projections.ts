import type { ChatApi } from "@/shared/schemas";

import { mapMessages } from "@/features/activity/api/projections/activity-message-projections";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

export function findGroupChat(chats: ChatApi[], groupId: string) {
  return chats.find((chat) => chat.groupId === groupId) ?? null;
}

export function mapGroupPinnedMessages(
  chat: Pick<ChatApi, "pinnedMessages">,
  participants: ActivityParticipant[],
  currentUserId: string | null,
) {
  return mapMessages(chat.pinnedMessages ?? [], participants, currentUserId);
}
