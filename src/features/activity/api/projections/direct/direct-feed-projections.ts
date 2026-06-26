import { mapSingleMessage } from "@/features/activity/api/projections/activity-message-projections";
import { getDirectChatParticipantUsers } from "@/features/activity/api/projections/participants/participant-collection-projections";
import type {
  ActivityParticipant,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi } from "@/shared/schemas";

import { mapDirectChat, mapNotesChat } from "./direct-chat-projections";

type ActivityFeedItem = UnifiedConversation;

export function buildDirectFeedItem(
  friendship: FriendshipApi,
  chatSummary: ChatApi | null,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem | null {
  const chat = mapDirectChat(friendship, currentUserParticipant, chatSummary);

  if (!chat) {
    return null;
  }

  return buildDirectFeedConversation(
    chat,
    chatSummary,
    currentUserParticipant,
    typingByChatId,
  );
}

function buildDirectFeedConversation(
  chat: NonNullable<ActivityFeedItem["chat"]>,
  chatSummary: ChatApi | null,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem {
  return {
    id: chat.id,
    kind: "dm",
    unreadCount: getChatUnreadCount(chatSummary),
    isTyping: getChatIsTyping(chat.id, typingByChatId),
    isPinned: getChatIsPinned(chatSummary),
    latestMessage: mapDirectLatestMessage(
      chatSummary,
      chat,
      currentUserParticipant.id,
    ),
    chat,
  };
}

export function buildNotesFeedItem(
  chatSummary: ChatApi,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem {
  const chat = mapNotesChat(chatSummary, currentUserParticipant);
  const latestMessage = chatSummary.lastMessage
    ? mapSingleMessage(
        chatSummary.lastMessage,
        [currentUserParticipant],
        currentUserParticipant.id,
      )
    : undefined;

  return {
    id: chat.id,
    kind: "dm",
    unreadCount: chatSummary.unreadCount ?? 0,
    isTyping: getChatIsTyping(chat.id, typingByChatId),
    isPinned: chatSummary.isPinned,
    latestMessage,
    chat,
  };
}

function mapDirectLatestMessage(
  chatSummary: ChatApi | null,
  chat: NonNullable<ActivityFeedItem["chat"]>,
  currentUserId: string,
) {
  if (!chatSummary?.lastMessage) {
    return undefined;
  }

  return mapSingleMessage(
    chatSummary.lastMessage,
    getDirectChatParticipantUsers(chat),
    currentUserId,
  );
}

function getChatIsTyping(
  chatId: string,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
) {
  return (typingByChatId[chatId]?.length ?? 0) > 0;
}

function getChatUnreadCount(chatSummary: ChatApi | null) {
  return chatSummary?.unreadCount ?? 0;
}

function getChatIsPinned(chatSummary: ChatApi | null) {
  return chatSummary?.isPinned ?? false;
}
