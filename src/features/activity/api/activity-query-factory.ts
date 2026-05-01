import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  User,
} from "@/shared/schemas";

import {
  ACTIVITY_QUERY_OPTIONS_CONTEXT,
  deriveActivityFeedData,
  mergeActivityConversationTimeline,
} from "./activity-context";
import type { ActivityFeedData } from "./activity-query-data";
import {
  flattenMessagePages,
  type ActivityMessagesInfiniteData,
} from "./activity-message-cache";
import { ActivityQueryOptions } from "./activity-query-options";
import type {
  ActivityParticipant,
  FilterChip,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export type {
  ActivityDirectSelectionData,
  ActivityFeedData,
  ActivityGroupSelectionData,
} from "./activity-query-data";

export const ActivityQueryFactory = {
  groups() {
    return ActivityQueryOptions.groups();
  },

  chats() {
    return ActivityQueryOptions.chats();
  },

  friendships() {
    return ActivityQueryOptions.friendships();
  },

  groupRatings(groupId: string) {
    return ActivityQueryOptions.groupRatings(groupId);
  },

  linkPreview(url: string) {
    return ActivityQueryOptions.linkPreview(url);
  },

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

  groupSelection(groupId: string) {
    return ActivityQueryOptions.groupSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      groupId,
    );
  },

  directSelection(chatId: string) {
    return ActivityQueryOptions.directSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      chatId,
    );
  },

  conversationMessages(chatId: string) {
    return ActivityQueryOptions.conversationMessages(chatId);
  },

  flattenMessagePages(data: ActivityMessagesInfiniteData | undefined) {
    return flattenMessagePages(data);
  },

  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[] {
    return ACTIVITY_QUERY_OPTIONS_CONTEXT.mapMessages(
      items,
      participants,
      currentUserId,
    );
  },

  buildConversationTimeline(
    messages: UnifiedMessage[],
    proposalMessages: UnifiedMessage[] = [],
  ) {
    return mergeActivityConversationTimeline(messages, proposalMessages);
  },
};
