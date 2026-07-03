import {
  buildDirectFeedItem,
  buildNotesFeedItem,
} from "@/features/activity/api/projections/activity-direct-projections";
import type {
  ChatIndexes,
  FeedItemGroups,
  TypingUsersByChatId,
} from "@/features/activity/api/projections/activity-feed-projections/types";
import { buildGroupFeedItem } from "@/features/activity/api/projections/activity-group-projections";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi, GroupApi } from "@/shared/schemas";

export function buildFeedItemGroups(
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
): FeedItemGroups {
  const chatIndexes = indexChats(chats);

  return {
    groupItems: buildGroupItems(
      groups,
      chatIndexes.byGroupId,
      currentUserParticipant,
      typingByChatId,
    ),
    directItems: buildDirectItems(
      friendships,
      chatIndexes.byId,
      currentUserParticipant,
      typingByChatId,
    ),
    notesItems: buildNotesItems(chats, currentUserParticipant, typingByChatId),
  };
}

function indexChats(chats: ChatApi[]): ChatIndexes {
  const byGroupId = new Map<string, ChatApi>();
  const byId = new Map(chats.map((chat) => [chat.id, chat]));

  for (const chat of chats) {
    if (chat.groupId) {
      byGroupId.set(chat.groupId, chat);
    }
  }

  return { byGroupId, byId };
}

function buildGroupItems(
  groups: GroupApi[],
  chatsByGroupId: Map<string, ChatApi>,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return groups.map((group) =>
    buildGroupFeedItem(
      group,
      chatsByGroupId.get(group.id) ?? null,
      currentUserParticipant,
      typingByChatId,
    ),
  );
}

function buildDirectItems(
  friendships: FriendshipApi[],
  chatsById: Map<string, ChatApi>,
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return friendships.flatMap((friendship) => {
    const chatSummary = friendship.privateChat
      ? (chatsById.get(friendship.privateChat.id) ?? null)
      : null;
    const item = buildDirectFeedItem(
      friendship,
      chatSummary,
      currentUserParticipant,
      typingByChatId,
    );

    return item ? [item] : [];
  });
}

function buildNotesItems(
  chats: ChatApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: TypingUsersByChatId,
) {
  return chats
    .filter((chat) => chat.type === "NOTES")
    .map((chat) =>
      buildNotesFeedItem(chat, currentUserParticipant, typingByChatId),
    );
}
