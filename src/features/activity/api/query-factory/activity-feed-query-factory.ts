import { deriveActivityFeedData } from "@/features/activity/api/activity-context";
import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type { FilterChip } from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi, GroupApi, User } from "@/shared/schemas";

export const ActivityFeedQueryFactory = {
  deriveFeedData(
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
    return deriveActivityFeedData(
      activeFilter,
      searchQuery,
      groups,
      chats,
      friendships,
      currentUser,
      typingByChatId,
    );
  },
};
