import {
  ACTIVITY_QUERY_OPTIONS_CONTEXT,
  mergeActivityConversationTimeline,
} from "@/features/activity/api/activity-context";
import { ActivityQueryOptions } from "@/features/activity/api/activity-query-options";
import type { ActivityMessagesInfiniteData } from "@/features/activity/api/messages/message-cache-types";
import { flattenMessagePages } from "@/features/activity/api/messages/message-mappers";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

export const ActivityMessageQueryFactory = {
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
