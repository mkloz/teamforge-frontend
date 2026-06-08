import {
  markActivityChatReadCache,
  removePinnedMessage,
  syncPinnedMessage,
  updateActivityChatSummaryCache,
  updateChatLastMessage,
} from "@/features/activity/api/context/activity-context-cache";
import {
  getGroupVersion,
  getPlanVersion,
  isSameFriendshipPair,
  mergeFriendshipList,
  mergeProposalIntoList,
} from "@/features/activity/api/context/activity-context-merge";
import {
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  buildProposalMessage,
  deriveActivityFeedData,
  findGroupChat,
  mapApiGroupFromSelection,
  mapCurrentUserParticipant,
  mapDirectChat,
  mapGroup,
  mapMessages,
  mapNotesChat,
  mergeActivityConversationTimeline,
} from "@/features/activity/api/context/activity-context-projections";
import {
  ensureBaseData,
  resolveChatId,
  resolveParticipants,
} from "@/features/activity/api/context/activity-context-resolvers";
import type { ActivityFeedStateMeta } from "@/features/activity/api/projections/activity-feed-projections";
import type {
  FilterChip,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, FriendshipApi, GroupApi, User } from "@/shared/schemas";
import type { ActivityActionContext } from "./activity-actions";
import type { ActivityFeedData } from "./activity-query-data";
import type { ActivityQueryOptionsContext } from "./activity-query-options";
import type { ActivityRealtimeContext } from "./activity-realtime";
import { ActivitySurfaceCache } from "./activity-surface-cache";

export { markActivityChatReadCache, updateActivityChatSummaryCache };

export function deriveActivityFeedDataForContext(
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
  meta?: ActivityFeedStateMeta,
): ActivityFeedData {
  return deriveActivityFeedData(
    activeFilter,
    searchQuery,
    groups,
    chats,
    friendships,
    currentUser,
    typingByChatId,
    meta,
  );
}

export function mergeActivityConversationTimelineForContext(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  return mergeActivityConversationTimeline(messages, proposalMessages);
}

export {
  deriveActivityFeedDataForContext as deriveActivityFeedData,
  mergeActivityConversationTimelineForContext as mergeActivityConversationTimeline,
};

export const ACTIVITY_QUERY_OPTIONS_CONTEXT: ActivityQueryOptionsContext = {
  buildGroupParticipants,
  buildProposalMessage,
  ensureBaseData,
  findGroupChat,
  mapDirectChat,
  mapNotesChat,
  mapGroup,
  mapMessages,
};

export const ACTIVITY_ACTION_CONTEXT: ActivityActionContext = {
  applyFriendshipUpdate: (friendship) =>
    ActivitySurfaceCache.applyFriendshipUpdate({
      friendship,
      mergeFriendshipList,
    }),
  applyRealtimeGroupUpdate: (currentUserId, group) =>
    ActivitySurfaceCache.applyRealtimeGroupUpdate({
      currentUserId,
      getGroupVersion,
      group,
      mapApiGroupFromSelection,
      mapGroup,
    }),
  ensureBaseData,
  mapMessages,
  removeFriendshipFromActivity: (friendship) =>
    ActivitySurfaceCache.removeFriendshipFromActivity({
      friendship,
      isSameFriendshipPair,
    }),
  removePinnedMessage,
  resolveChatId,
  resolveParticipants: (kind, selectedId, currentUserParticipant) =>
    resolveParticipants(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      kind,
      selectedId,
      currentUserParticipant,
    ),
  syncPinnedMessage,
  updateChatLastMessage,
};

export const ACTIVITY_REALTIME_CONTEXT: ActivityRealtimeContext = {
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  buildProposalMessage,
  getGroupVersion,
  getPlanVersion,
  isSameFriendshipPair,
  mapApiGroupFromSelection,
  mapCurrentUserParticipant,
  mapGroup,
  mapMessages,
  mergeFriendshipList,
  mergeProposalIntoList,
  removePinnedMessage,
  syncPinnedMessage,
  updateChatSummaryCache: updateActivityChatSummaryCache,
};
