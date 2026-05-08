import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type { FilterChip } from "@/features/activity/lib/activity-contract";
import {
  applyFilter,
  sortByRecency,
} from "@/features/activity/lib/unify-conversations";
import type { ChatApi, FriendshipApi, GroupApi, User } from "@/shared/schemas";
import { buildDirectFeedItem } from "./activity-direct-projections";
import { buildGroupFeedItem } from "./activity-group-projections";
import { mapCurrentUserParticipant } from "./activity-participant-projections";

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
  const items = sortByRecency([...groupItems, ...directItems]);

  return {
    items: applyFilter(items, activeFilter, searchQuery),
    groupCount: groupItems.length,
    dmCount: directItems.length,
    unreadCount: items.filter((item) => item.unreadCount > 0).length,
  };
}
