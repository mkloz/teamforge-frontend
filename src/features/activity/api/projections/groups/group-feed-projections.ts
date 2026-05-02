import type { ChatApi, GroupApi } from "@/shared/schemas";

import { mapSingleMessage } from "@/features/activity/api/projections/activity-message-projections";
import { buildGroupParticipants } from "@/features/activity/api/projections/activity-participant-projections";
import type {
  ActivityParticipant,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";

import { findGroupChat } from "./group-chat-projections";
import { mapGroup } from "./group-dto-projections";

type ActivityFeedItem = UnifiedConversation;

export function buildGroupFeedItem(
  groupDto: GroupApi,
  chats: ChatApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem {
  const chat = findGroupChat(chats, groupDto.id);
  const group = mapGroup(groupDto, currentUserParticipant.id, [], chat ?? null);
  const participants = buildGroupParticipants(group, currentUserParticipant);
  const latestMessage = chat?.lastMessage
    ? mapSingleMessage(
        chat.lastMessage,
        participants,
        currentUserParticipant.id,
      )
    : undefined;

  return {
    id: group.id,
    kind: "group",
    unreadCount: chat?.unreadCount ?? 0,
    isTyping: chat ? (typingByChatId[chat.id]?.length ?? 0) > 0 : false,
    latestMessage,
    group,
  };
}
