import { mapSingleMessage } from "@/features/activity/api/projections/activity-message-projections";
import { buildGroupParticipants } from "@/features/activity/api/projections/activity-participant-projections";
import type {
  ActivityParticipant,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, GroupApi } from "@/shared/schemas";

import { mapGroup } from "./group-dto-projections";

type ActivityFeedItem = UnifiedConversation;
type TypingParticipantsByChatId = Record<
  string,
  Array<{ id: string; name: string; avatar: string | null }>
>;

export function buildGroupFeedItem(
  groupDto: GroupApi,
  chat: ChatApi | null,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingParticipantsByChatId,
): ActivityFeedItem {
  const group = mapGroup(groupDto, currentUserParticipant.id, [], chat ?? null);
  const participants = buildGroupParticipants(group, currentUserParticipant);
  const chatState = buildGroupChatState({
    chat,
    currentUserId: currentUserParticipant.id,
    participants,
    typingByChatId,
  });

  return {
    id: group.id,
    kind: "group",
    unreadCount: chatState.unreadCount,
    isTyping: chatState.isTyping,
    isPinned: chatState.isPinned,
    latestMessage: chatState.latestMessage,
    group,
  };
}

function buildGroupChatState({
  chat,
  currentUserId,
  participants,
  typingByChatId,
}: {
  chat: ChatApi | null;
  currentUserId: string;
  participants: ActivityParticipant[];
  typingByChatId: TypingParticipantsByChatId;
}) {
  return {
    unreadCount: chat?.unreadCount ?? 0,
    isTyping: getIsChatTyping(chat, typingByChatId),
    isPinned: chat?.isPinned ?? false,
    latestMessage: mapLatestGroupMessage(chat, participants, currentUserId),
  };
}

function getIsChatTyping(
  chat: ChatApi | null,
  typingByChatId: TypingParticipantsByChatId,
) {
  if (!chat) {
    return false;
  }

  return (typingByChatId[chat.id]?.length ?? 0) > 0;
}

function mapLatestGroupMessage(
  chat: ChatApi | null,
  participants: ActivityParticipant[],
  currentUserId: string,
) {
  if (!chat?.lastMessage) {
    return undefined;
  }

  return mapSingleMessage(chat.lastMessage, participants, currentUserId);
}
