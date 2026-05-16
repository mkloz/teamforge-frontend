import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  applyFilter,
  sortByPinnedThenRecency,
} from "@/features/activity/lib/unify-conversations";
import type { ChatApi, FriendshipApi, GroupApi, User } from "@/shared/schemas";
import {
  buildDirectFeedItem,
  buildNotesFeedItem,
} from "./activity-direct-projections";
import { buildGroupFeedItem } from "./activity-group-projections";
import { mapCurrentUserParticipant } from "./activity-participant-projections";

export interface ActivityFeedStateMeta {
  pinnedConversationKeys: string[];
  savedMessagesById: Record<string, SavedMessageSnapshot>;
}

export function deriveFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUser: User,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
  meta: ActivityFeedStateMeta = {
    pinnedConversationKeys: [],
    savedMessagesById: {},
  },
): ActivityFeedData {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const groupItems = groups.map((group) =>
    buildGroupFeedItem(group, chats, currentUserParticipant, typingByChatId),
  );
  const directItems = friendships.flatMap((friendship) => {
    const item = buildDirectFeedItem(
      friendship,
      chats,
      currentUserParticipant,
      typingByChatId,
    );

    return item ? [item] : [];
  });
  const notesItems = chats
    .filter((chat) => chat.type === "NOTES")
    .map((chat) =>
      buildNotesFeedItem(chat, currentUserParticipant, typingByChatId),
    );
  const items = sortByPinnedThenRecency(
    enrichFeedItems([...notesItems, ...groupItems, ...directItems], meta),
    meta.pinnedConversationKeys,
  );

  return {
    allItems: items,
    items: applyFilter(items, activeFilter, searchQuery),
    groupCount: groupItems.length,
    dmCount: directItems.length + notesItems.length,
    unreadCount: items.filter((item) => item.unreadCount > 0).length,
    pinnedCount: items.filter((item) => item.isPinned).length,
    savedCount: Object.keys(meta.savedMessagesById).length,
  };
}

function enrichFeedItems(
  items: UnifiedConversation[],
  meta: ActivityFeedStateMeta,
): UnifiedConversation[] {
  const savedByConversation = groupSavedMessagesByConversation(
    meta.savedMessagesById,
  );

  return items.map((item) => {
    const key = getActivityConversationKey(item.kind, item.id);
    const savedMessages = savedByConversation.get(key) ?? [];

    return {
      ...item,
      isPinned: meta.pinnedConversationKeys.includes(key),
      savedMessageCount: savedMessages.length,
      latestSavedMessage: savedMessages[0]?.message,
    };
  });
}

function groupSavedMessagesByConversation(
  savedMessagesById: Record<string, SavedMessageSnapshot>,
) {
  const grouped = new Map<string, SavedMessageSnapshot[]>();

  for (const snapshot of Object.values(savedMessagesById)) {
    const key = getActivityConversationKey(
      snapshot.conversationKind,
      snapshot.conversationId,
    );
    const current = grouped.get(key) ?? [];

    grouped.set(key, [...current, snapshot]);
  }

  for (const [key, snapshots] of grouped) {
    grouped.set(
      key,
      [...snapshots].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      ),
    );
  }

  return grouped;
}
