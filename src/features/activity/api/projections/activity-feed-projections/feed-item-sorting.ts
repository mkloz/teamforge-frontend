import { enrichFeedItems } from "@/features/activity/api/projections/activity-feed-projections/feed-item-enrichment";
import type {
  ActivityFeedStateMeta,
  FeedItemGroups,
} from "@/features/activity/api/projections/activity-feed-projections/types";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { sortByPinnedThenRecency } from "@/features/activity/lib/unify-conversations";

export function buildSortedFeedItems(
  feedItemGroups: FeedItemGroups,
  meta: ActivityFeedStateMeta,
  currentUserId: string,
) {
  return sortByPinnedThenRecency(
    enrichFeedItems(flattenFeedItems(feedItemGroups), meta, currentUserId),
    meta.pinnedConversationKeys,
  );
}

function flattenFeedItems({
  notesItems,
  groupItems,
  directItems,
}: FeedItemGroups): UnifiedConversation[] {
  return [...notesItems, ...groupItems, ...directItems];
}
