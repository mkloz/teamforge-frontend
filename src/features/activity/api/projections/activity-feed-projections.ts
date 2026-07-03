import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import { buildActivityFeedData } from "@/features/activity/api/projections/activity-feed-projections/activity-feed-data";
import { buildFeedItemGroups } from "@/features/activity/api/projections/activity-feed-projections/feed-item-groups";
import { buildSortedFeedItems } from "@/features/activity/api/projections/activity-feed-projections/feed-item-sorting";
import type {
  ActivityFeedStateMeta,
  TypingUsersByChatId,
} from "@/features/activity/api/projections/activity-feed-projections/types";
import { mapCurrentUserParticipant } from "@/features/activity/api/projections/activity-participant-projections";
import type { FilterChip } from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi, GroupApi, User } from "@/shared/schemas";

export type { ActivityFeedStateMeta } from "@/features/activity/api/projections/activity-feed-projections/types";

export function deriveFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUser: User,
  typingByChatId: TypingUsersByChatId,
  meta: ActivityFeedStateMeta = {
    pinnedConversationKeys: [],
    planProposalsByGroupId: {},
    savedMessagesById: {},
  },
): ActivityFeedData {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const feedItemGroups = buildFeedItemGroups(
    groups,
    chats,
    friendships,
    currentUserParticipant,
    typingByChatId,
  );

  const items = buildSortedFeedItems(feedItemGroups, meta, currentUser.id);

  return buildActivityFeedData(
    activeFilter,
    searchQuery,
    items,
    feedItemGroups,
    meta,
  );
}
