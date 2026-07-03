import type { ActivityFeedData } from "@/features/activity/api/activity-query-data";
import type {
  ActivityFeedStateMeta,
  FeedItemGroups,
} from "@/features/activity/api/projections/activity-feed-projections/types";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { applyFilter } from "@/features/activity/lib/unify-conversations";

export function buildActivityFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  items: UnifiedConversation[],
  { groupItems, directItems, notesItems }: FeedItemGroups,
  meta: ActivityFeedStateMeta,
): ActivityFeedData {
  return {
    allItems: items,
    items: applyFilter(items, activeFilter, searchQuery),
    groupCount: groupItems.length,
    dmCount: directItems.length + notesItems.length,
    unreadCount: items.filter((item) => item.unreadCount > 0).length,
    pinnedCount: items.filter((item) => item.isPinned).length,
    allUnreadMessageCount: countUnreadMessages(items),
    groupUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.kind === "group"),
    ),
    dmUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.kind === "dm"),
    ),
    pinnedUnreadMessageCount: countUnreadMessages(
      items.filter((item) => item.isPinned),
    ),
    savedCount: Object.keys(meta.savedMessagesById).length,
  };
}

function countUnreadMessages(items: UnifiedConversation[]) {
  return items.reduce((total, item) => total + item.unreadCount, 0);
}
