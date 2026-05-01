import type { ChatApi, FriendshipApi } from "@/shared/schemas";

import type {
  ActivityParticipant,
  DirectChat,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { mapFriendshipUserParticipant } from "./activity-participant-projections";
import { mapMessages, mapSingleMessage } from "./activity-message-projections";

type ActivityFeedItem = UnifiedConversation;

export function mapDirectChat(
  friendship: FriendshipApi,
  currentUser: ActivityParticipant,
  chatSummary?: ChatApi | null,
): DirectChat | null {
  if (!friendship.privateChat) {
    return null;
  }

  const participant = mapFriendshipUserParticipant(friendship.counterpart);
  const participants = [
    {
      userId: participant.id,
      chatId: friendship.privateChat.id,
      user: participant,
    },
    {
      userId: currentUser.id,
      chatId: friendship.privateChat.id,
      user: currentUser,
    },
  ];

  return {
    id: friendship.privateChat.id,
    type: friendship.privateChat.type,
    createdAt: friendship.privateChat.createdAt,
    groupId: null,
    participants,
    pinnedMessages: mapMessages(
      chatSummary?.pinnedMessages ?? [],
      participants
        .map((item) => item.user)
        .filter((item): item is ActivityParticipant => item !== undefined),
      currentUser.id,
    ),
    isMuted: false,
    isBlocked: friendship.status === "BLOCKED",
    mutualGroups: [],
  };
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
  const chatSummary = friendship.privateChat
    ? (chats.find((chat) => chat.id === friendship.privateChat?.id) ?? null)
    : null;
  const chat = mapDirectChat(friendship, currentUserParticipant, chatSummary);

  if (!chat) {
    return null;
  }

  const latestMessage = chatSummary?.lastMessage
    ? mapSingleMessage(
        chatSummary.lastMessage,
        chat.participants
          ?.map((participant) => participant.user)
          .filter(
            (participant): participant is ActivityParticipant =>
              participant !== undefined,
          ) ?? [],
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
