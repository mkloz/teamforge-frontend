import { mapSingleMessage } from "@/features/activity/api/projections/activity-message-projections";
import type {
  ActivityParticipant,
  DirectChat,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi } from "@/shared/schemas";

import { mapDirectChat } from "./direct-chat-projections";

type ActivityFeedItem = UnifiedConversation;

function findDirectChatSummary(
  friendship: FriendshipApi,
  chats: ChatApi[],
): ChatApi | null {
  return friendship.privateChat
    ? (chats.find((chat) => chat.id === friendship.privateChat?.id) ?? null)
    : null;
}

function getDirectChatParticipants(chat: DirectChat) {
  return (
    chat.participants
      ?.map((participant) => participant.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? []
  );
}

export function buildDirectFeedItem(
  friendship: FriendshipApi,
  chats: ChatApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem | null {
  const chatSummary = findDirectChatSummary(friendship, chats);
  const chat = mapDirectChat(friendship, currentUserParticipant, chatSummary);

  if (!chat) {
    return null;
  }

  const latestMessage = chatSummary?.lastMessage
    ? mapSingleMessage(
        chatSummary.lastMessage,
        getDirectChatParticipants(chat),
        currentUserParticipant.id,
      )
    : undefined;

  return {
    id: chat.id,
    kind: "dm",
    unreadCount: chatSummary?.unreadCount ?? 0,
    isTyping: (typingByChatId[chat.id]?.length ?? 0) > 0,
    latestMessage,
    chat,
  };
}
